# chatbot.py - RAG Chatbot with PROPER response formatting

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from app.services.vector_service import vector_service
from app.services.llm_service import llm_service
from app.api.auth import get_current_session
import logging
from datetime import datetime
from typing import List, Dict, Any, Optional
import json
import re

router = APIRouter()
logger = logging.getLogger(__name__)

# --- Request/Response Models ---
class ChatMessage(BaseModel):
    role: str
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
    session_id: str

# --- Enhanced Legal System Prompt ---
LEGAL_CHATBOT_SYSTEM_PROMPT = """You are KMRL Legal Assistant, an expert AI legal analyst. You MUST respond in well-formatted markdown that is professional and easy to read.

CRITICAL RESPONSE FORMAT RULES:
1. Use proper markdown headers (##, ###)
2. Use **bold** for important terms
3. Use bullet points for lists
4. Use numbered lists for steps or sequences
5. Quote important text sections
6. Always structure your response clearly

Example response format:
## Analysis Summary
**Key Finding:** [Your main point]

### Details
- Point 1: Description
- Point 2: Description

### Legal Implications
**Risk Level:** [High/Medium/Low]
**Recommendation:** [Your advice]

> **Important Quote from Document**
> "Quoted text from the contract"

### Related Questions
1. Question about terms?
2. Question about obligations?

NEVER return raw JSON or unformatted text. Always use proper markdown formatting."""

# --- Context Retrieval ---
async def get_intelligent_context(query: str, document_id: str, max_chunks: int = 8) -> List[Dict[str, Any]]:
    try:
        logger.info(f"🧠 Retrieving context for: '{query[:50]}...'")
        
        # Get relevant chunks
        primary_chunks = await vector_service.retrieve_relevant_chunks(
            query=query,
            document_id=document_id,
            top_k=max_chunks
        )
        
        logger.info(f"✅ Retrieved {len(primary_chunks)} context chunks")
        return primary_chunks[:max_chunks]
        
    except Exception as e:
        logger.error(f"❌ Context retrieval failed: {str(e)}")
        return []

# --- Response Formatting Function ---
def format_llm_response(raw_response: str) -> str:
    """
    Convert any response format to proper markdown
    """
    try:
        # If it's already markdown, return as is
        if '##' in raw_response or '**' in raw_response:
            return raw_response
            
        # Try to parse if it looks like structured data
        if raw_response.startswith('{') or raw_response.startswith('['):
            try:
                # Remove outer quotes and clean up
                cleaned = raw_response.strip("'\"")
                
                # Try to parse as dict-like structure
                if 'obligation' in cleaned and 'description' in cleaned:
                    parts = cleaned.split("', '")
                    
                    formatted_response = "## Document Analysis\n\n"
                    
                    for part in parts:
                        if 'obligation' in part:
                            obligation = part.split("'obligation': '")[1] if "'obligation': '" in part else ""
                            if obligation:
                                formatted_response += f"### 📋 Obligation: {obligation}\n\n"
                        
                        elif 'description' in part:
                            description = part.split("'description': '")[1] if "'description': '" in part else ""
                            if description:
                                formatted_response += f"**Description:** {description}\n\n"
                        
                        elif 'reference' in part:
                            reference = part.split("'reference': '")[1] if "'reference': '" in part else ""
                            if reference:
                                formatted_response += f"**Reference:** {reference}\n\n"
                        
                        elif 'legalImplications' in part:
                            implications = part.split("'legalImplications': '")[1] if "'legalImplications': '" in part else ""
                            if implications:
                                formatted_response += f"### ⚖️ Legal Implications\n{implications}\n\n"
                    
                    return formatted_response
                    
            except Exception as parse_error:
                logger.warning(f"⚠️ Failed to parse structured response: {parse_error}")
        
        # For plain text, add basic formatting
        formatted = raw_response
        
        # Add headers to common legal terms
        formatted = re.sub(r'(Service Bond|Confidentiality|Intellectual Property|Code of Conduct|Acceptance)', 
                          r'### \1', formatted)
        
        # Bold important terms
        formatted = re.sub(r'(INR [0-9,]+|minimum period of \d+ years|liquidated damages)', 
                          r'**\1**', formatted)
        
        # Add structure
        if not formatted.startswith('#'):
            formatted = "## Legal Document Analysis\n\n" + formatted
        
        return formatted
        
    except Exception as e:
        logger.error(f"❌ Response formatting failed: {str(e)}")
        return f"## Response\n\n{raw_response}"

# --- Enhanced RAG Prompt ---
def create_rag_prompt(user_question: str, document_context: str, conversation_history: List[ChatMessage], document_id: str) -> str:
    conversation_context = ""
    if conversation_history:
        conversation_context = "\n\nCONVERSATION HISTORY:\n"
        for msg in conversation_history[-4:]:
            role_label = "User" if msg.role == "user" else "Assistant"
            conversation_context += f"{role_label}: {msg.content[:200]}...\n"

    rag_prompt = f"""
DOCUMENT CONTEXT:
{document_context}

{conversation_context}

USER QUESTION: {user_question}

INSTRUCTIONS:
Analyze the document context and provide a comprehensive answer in PROPER MARKDOWN FORMAT. Structure your response professionally with headers, bullet points, and emphasis where appropriate.

Focus on:
- Direct answers based on document content
- Legal implications and risks
- Specific clause references
- Practical advice for the user
- Clear formatting with markdown

Respond in well-structured markdown format with proper headers and formatting."""

    return rag_prompt

# --- Main Chat Endpoint ---
@router.post("/chat", response_model=ChatResponse)
async def chat_with_document(
    request: ChatRequest,
    current_session: dict = Depends(get_current_session)
):
    try:
        session_id = current_session["session_id"]
        session_document_id = f"{session_id}_{request.document_id}"
        
        logger.info(f"💬 Chat request for document: {request.document_id}")
        logger.info(f"🎯 User question: '{request.message[:100]}...'")

        # Get context
        context_chunks = await get_intelligent_context(
            query=request.message,
            document_id=session_document_id,
            max_chunks=request.max_context_chunks
        )

        # Prepare context text
        if not context_chunks:
            context_text = "No specific relevant content found in the document for this query."
        else:
            context_parts = []
            for i, chunk in enumerate(context_chunks):
                section_header = f"--- DOCUMENT SECTION {chunk['chunk_index'] + 1} ---"
                context_parts.append(f"{section_header}\n{chunk['text']}")
            context_text = "\n\n".join(context_parts)

        # Create RAG prompt
        rag_prompt = create_rag_prompt(
            user_question=request.message,
            document_context=context_text,
            conversation_history=request.conversation_history,
            document_id=request.document_id
        )

        # Call LLM with enhanced prompt
        logger.info(f"🤖 Generating response with enhanced formatting")
        llm_response = await llm_service.call_groq(
            rag_prompt,
            system_message=LEGAL_CHATBOT_SYSTEM_PROMPT
        )

        # Extract and format response
        if isinstance(llm_response, dict):
            raw_response = llm_response.get("content", str(llm_response))
        else:
            raw_response = str(llm_response)

        # Format the response properly
        formatted_response = format_llm_response(raw_response)

        # Calculate confidence
        confidence_score = min(0.95, 0.5 + (len(context_chunks) * 0.1))

        # Prepare sources
        sources = []
        for chunk in context_chunks:
            sources.append({
                "chunk_id": chunk["id"],
                "chunk_index": chunk["chunk_index"],
                "relevance_score": chunk["score"],
                "text_preview": chunk["text"][:200] + "..." if len(chunk["text"]) > 200 else chunk["text"],
                "section_type": chunk.get("section_type", "standard"),
                "word_count": len(chunk["text"].split()),
                "character_count": len(chunk["text"])
            })

        conversation_id = f"conv_{session_id}_{request.document_id}_{int(datetime.now().timestamp())}"

        logger.info(f"✅ Chat response generated and formatted successfully")
        return ChatResponse(
            response=formatted_response,
            document_id=request.document_id,
            sources=sources,
            conversation_id=conversation_id,
            timestamp=datetime.now().isoformat(),
            context_used=len(context_chunks),
            model_used="llama-3.3-70b-versatile",
            confidence_score=confidence_score,
            session_id=session_id
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Chat processing failed: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Chat processing failed: {str(e)}"
        )

# --- Chat Suggestions ---
@router.get("/suggestions/{document_id}")
async def get_chat_suggestions(
    document_id: str,
    current_session: dict = Depends(get_current_session)
):
    try:
        session_id = current_session["session_id"]
        
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
            "timestamp": datetime.now().isoformat(),
            "session_id": session_id
        }

    except Exception as e:
        logger.error(f"❌ Failed to generate suggestions: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate suggestions: {str(e)}")

# --- Health Check ---
@router.get("/health")
async def chatbot_health_check():
    try:
        return {
            "service": "KMRL Legal Chatbot",
            "status": "operational",
            "features": ["Session-based auth", "RAG", "Markdown formatting"],
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        return {
            "service": "KMRL Legal Chatbot",
            "status": "degraded", 
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }

# Export router
chatbot_router = router
