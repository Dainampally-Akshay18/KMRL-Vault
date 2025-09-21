# chatbot.py - World-Class Legal Document RAG Chatbot with JWT Authentication
from fastapi import APIRouter, HTTPException, Depends, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
import logging
from datetime import datetime
from typing import List, Dict, Any, Optional
import json
import jwt
from app.services.vector_service import vector_service
from app.services.llm_service import llm_service
from app.api.auth import get_current_session
from app.config import settings

router = APIRouter()
logger = logging.getLogger(__name__)
security = HTTPBearer()

# --- Request/Response Models ---
class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str
    timestamp: Optional[str] = None

class ChatRequest(BaseModel):
    message: str
    document_id: str
    conversation_history: List[ChatMessage] = []
    max_context_chunks: int = 8
    include_document_context: bool = True

class ChatResponse(BaseModel):
    response: str
    document_id: str
    sources: List[Dict[str, Any]]
    conversation_id: str
    timestamp: str
    context_used: int
    model_used: str
    confidence_score: float

class ConversationSummary(BaseModel):
    conversation_id: str
    total_messages: int
    document_topics_discussed: List[str]
    key_insights: List[str]
    last_activity: str

# --- JWT Token Validation ---
def verify_document_token(credentials: HTTPAuthorizationCredentials = Depends(security)) -> Dict[str, Any]:
    """
    Verify JWT token for document access and extract document permissions
    """
    try:
        token = credentials.credentials
        payload = jwt.decode(
            token, 
            settings.JWT_SECRET_KEY, 
            algorithms=["HS256"]
        )
        
        # Validate token structure for document access
        required_fields = ["document_id", "session_id", "exp", "permissions"]
        for field in required_fields:
            if field not in payload:
                raise HTTPException(
                    status_code=401, 
                    detail=f"Invalid token: missing {field}"
                )
        
        # Check document permissions
        permissions = payload.get("permissions", [])
        if "read" not in permissions and "chat" not in permissions:
            raise HTTPException(
                status_code=403, 
                detail="Insufficient permissions for document chat"
            )
        
        logger.info(f"✅ Token validated for document: {payload['document_id']}")
        return payload
        
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")

# --- Advanced RAG Prompt Templates ---
LEGAL_CHATBOT_SYSTEM_PROMPT = """You are KMRL Legal Assistant, an expert AI legal analyst specializing in contract review, legal document analysis, and providing precise legal guidance. You have access to the user's uploaded legal document and can reference specific sections to answer questions.

Your expertise includes:
- Contract interpretation and clause analysis
- Risk assessment and legal implications
- Compliance and regulatory requirements
- Legal terminology explanation
- Document structure and organization analysis

CRITICAL GUIDELINES:
1. Always base your answers on the provided document context
2. If information is not in the document, clearly state this limitation
3. Use legal terminology appropriately but explain complex terms
4. Provide specific clause references when possible
5. Maintain professional, authoritative tone
6. Never provide general legal advice - focus on document-specific analysis
7. When discussing risks, be specific about potential legal consequences
8. Support your analysis with direct quotes from the document when relevant

RESPONSE FORMAT:
- Start with a direct answer to the user's question
- Provide supporting evidence from the document
- Include specific section/clause references
- Explain any legal implications
- Suggest follow-up questions if relevant"""

def create_rag_prompt(user_question: str, document_context: str, conversation_history: List[ChatMessage], document_id: str) -> str:
    """
    Create a sophisticated RAG prompt for legal document analysis
    """
    # Build conversation context
    conversation_context = ""
    if conversation_history:
        conversation_context = "\n\nCONVERSATION HISTORY:\n"
        for msg in conversation_history[-6:]:  # Last 6 messages for context
            role_label = "User" if msg.role == "user" else "Legal Assistant"
            conversation_context += f"{role_label}: {msg.content}\n"
    
    # Sophisticated prompt construction
    rag_prompt = f"""
DOCUMENT CONTEXT FROM '{document_id}':
{document_context}

{conversation_context}

CURRENT USER QUESTION:
{user_question}

TASK:
As KMRL Legal Assistant, analyze the provided document context and conversation history to answer the user's question with precision and legal expertise. Reference specific sections, clauses, or terms from the document where applicable.

RESPONSE REQUIREMENTS:
1. Provide a direct, authoritative answer based on the document
2. Quote relevant sections with specific references
3. Explain legal implications and potential risks
4. Use professional legal language while remaining accessible
5. If the question cannot be answered from the document, clearly state this
6. Suggest related questions that could be answered from the document

ANSWER:"""
    
    return rag_prompt

# --- Intelligent Context Retrieval ---
async def get_intelligent_context(query: str, document_id: str, max_chunks: int = 8) -> List[Dict[str, Any]]:
    """
    Retrieve the most relevant document context using advanced strategies
    """
    try:
        logger.info(f"🧠 Intelligent context retrieval for: '{query[:50]}...'")
        
        # Strategy 1: Direct semantic search
        primary_chunks = await vector_service.retrieve_relevant_chunks(
            query=query,
            document_id=document_id,
            top_k=max_chunks
        )
        
        # Strategy 2: If insufficient context, use legal-focused queries
        if len(primary_chunks) < 3:
            logger.info("📚 Expanding context with legal-focused search")
            
            legal_expansion_queries = [
                f"terms conditions {query}",
                f"obligations responsibilities {query}",
                f"legal requirements {query}",
                "contract agreement legal document"
            ]
            
            additional_chunks = []
            for expansion_query in legal_expansion_queries:
                extra_chunks = await vector_service.retrieve_relevant_chunks(
                    query=expansion_query,
                    document_id=document_id,
                    top_k=3
                )
                additional_chunks.extend(extra_chunks)
            
            # Combine and deduplicate
            seen_ids = {chunk["id"] for chunk in primary_chunks}
            for chunk in additional_chunks:
                if chunk["id"] not in seen_ids and len(primary_chunks) < max_chunks:
                    primary_chunks.append(chunk)
                    seen_ids.add(chunk["id"])
        
        # Sort by relevance score and chunk index for coherent context
        primary_chunks.sort(key=lambda x: (-x["score"], x["chunk_index"]))
        
        logger.info(f"✅ Retrieved {len(primary_chunks)} context chunks")
        return primary_chunks[:max_chunks]
        
    except Exception as e:
        logger.error(f"❌ Context retrieval failed: {str(e)}")
        return []

# --- Core Chatbot Endpoint ---
@router.post("/chat", response_model=ChatResponse)
async def chat_with_document(
    request: ChatRequest,
    token_payload: Dict[str, Any] = Depends(verify_document_token)
):
    """
    Intelligent RAG-powered chat with legal documents
    """
    try:
        # Validate document access
        token_document_id = token_payload["document_id"]
        session_id = token_payload["session_id"]
        
        # Create session-specific document ID for vector search
        session_document_id = f"{session_id}_{request.document_id}"
        
        if token_document_id != request.document_id:
            raise HTTPException(
                status_code=403, 
                detail="Token does not grant access to specified document"
            )
        
        logger.info(f"💬 Chat request for document: {request.document_id}")
        logger.info(f"🎯 User question: '{request.message[:100]}...'")
        
        # Retrieve intelligent context
        context_chunks = await get_intelligent_context(
            query=request.message,
            document_id=session_document_id,
            max_chunks=request.max_context_chunks
        )
        
        if not context_chunks and request.include_document_context:
            logger.warning("⚠️ No relevant context found in document")
            context_text = "No relevant content found in the document for this query."
        else:
            # Combine context chunks intelligently
            context_parts = []
            for i, chunk in enumerate(context_chunks):
                section_header = f"--- DOCUMENT SECTION {chunk['chunk_index'] + 1} ---"
                context_parts.append(f"{section_header}\n{chunk['text']}")
            
            context_text = "\n\n".join(context_parts)
        
        # Create sophisticated RAG prompt
        rag_prompt = create_rag_prompt(
            user_question=request.message,
            document_context=context_text,
            conversation_history=request.conversation_history,
            document_id=request.document_id
        )
        
        # Generate response using enhanced LLM
        logger.info(f"🤖 Generating response with {len(context_text)} characters of context")
        
        llm_response = await llm_service.call_groq(
            prompt=rag_prompt,
            system_message=LEGAL_CHATBOT_SYSTEM_PROMPT
        )
        
        # Extract response content
        if isinstance(llm_response, dict):
            if "content" in llm_response:
                response_text = llm_response["content"]
            elif "result" in llm_response:
                response_text = llm_response["result"]
            else:
                response_text = str(llm_response)
        else:
            response_text = str(llm_response)
        
        # Calculate confidence score based on context quality
        confidence_score = min(0.95, 0.5 + (len(context_chunks) * 0.1) + (0.2 if context_chunks else 0))
        
        # Prepare source information
        sources = []
        for chunk in context_chunks:
            sources.append({
                "chunk_id": chunk["id"],
                "chunk_index": chunk["chunk_index"],
                "relevance_score": chunk["score"],
                "text_preview": chunk["text"][:200] + "..." if len(chunk["text"]) > 200 else chunk["text"],
                "section_type": chunk.get("section_type", "standard")
            })
        
        # Generate conversation ID
        conversation_id = f"conv_{session_id}_{request.document_id}_{int(datetime.now().timestamp())}"
        
        logger.info(f"✅ Chat response generated successfully")
        
        return ChatResponse(
            response=response_text,
            document_id=request.document_id,
            sources=sources,
            conversation_id=conversation_id,
            timestamp=datetime.now().isoformat(),
            context_used=len(context_chunks),
            model_used="llama-3.3-70b-versatile",
            confidence_score=confidence_score
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Chat processing failed: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail=f"Chat processing failed: {str(e)}"
        )

# --- Additional Chatbot Features ---
@router.post("/chat/explain-clause")
async def explain_legal_clause(
    clause_text: str,
    document_id: str,
    token_payload: Dict[str, Any] = Depends(verify_document_token)
):
    """
    Specialized endpoint for explaining specific legal clauses
    """
    try:
        specialized_prompt = f"""
Analyze and explain the following legal clause in detail:

CLAUSE TO ANALYZE:
{clause_text}

EXPLANATION REQUIRED:
1. Plain English interpretation of the clause
2. Legal obligations created by this clause
3. Potential risks or benefits
4. Key terms and their definitions
5. Practical implications for the parties involved
6. Common issues or disputes that arise from similar clauses

Provide a comprehensive yet accessible explanation suitable for legal professionals and informed business users.
"""
        
        response = await llm_service.call_groq(
            prompt=specialized_prompt,
            system_message=LEGAL_CHATBOT_SYSTEM_PROMPT
        )
        
        return {
            "clause_explanation": response.get("content", str(response)),
            "document_id": document_id,
            "analysis_type": "clause_explanation",
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"❌ Clause explanation failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Clause explanation failed: {str(e)}")

@router.get("/chat/suggestions/{document_id}")
async def get_chat_suggestions(
    document_id: str,
    token_payload: Dict[str, Any] = Depends(verify_document_token)
):
    """
    Generate intelligent chat suggestions based on document content
    """
    try:
        suggestions = [
            "What are the key obligations in this contract?",
            "What are the termination conditions?",
            "Are there any penalty clauses or liquidated damages?",
            "What are the payment terms and schedules?",
            "What confidentiality requirements are specified?",
            "What are the dispute resolution mechanisms?",
            "Are there any compliance or regulatory requirements?",
            "What intellectual property rights are addressed?",
            "What are the liability limitations?",
            "What renewal or extension options exist?"
        ]
        
        return {
            "document_id": document_id,
            "suggested_questions": suggestions,
            "category": "legal_document_analysis",
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"❌ Failed to generate suggestions: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate suggestions: {str(e)}")

# --- Health Check ---
@router.get("/chat/health")
async def chatbot_health_check():
    """
    Health check for the legal chatbot service
    """
    try:
        # Check vector service
        vector_health = await vector_service.health_check()
        
        # Check LLM service
        llm_health = await llm_service.health_check()
        
        return {
            "service": "KMRL Legal Chatbot",
            "status": "operational",
            "features": [
                "JWT-based document authentication",
                "Retrieval-Augmented Generation (RAG)",
                "Legal document specialization",
                "Intelligent context retrieval",
                "Conversation history support",
                "Clause-specific analysis",
                "Professional legal guidance"
            ],
            "vector_service": vector_health,
            "llm_service": llm_health,
            "model": "llama-3.3-70b-versatile",
            "capabilities": [
                "Contract analysis",
                "Risk assessment", 
                "Legal interpretation",
                "Compliance guidance",
                "Document navigation"
            ],
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"❌ Chatbot health check failed: {str(e)}")
        return {
            "service": "KMRL Legal Chatbot",
            "status": "degraded",
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }

# Export router
chatbot_router = router