from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.models.document import Document
from app.schemas.document import DocumentCreate, DocumentRead
from app.models.user import User
from app.api.deps import get_current_user
import logging
import traceback
from app.core.logging import logger

router = APIRouter()

@router.post("/", response_model=DocumentRead)
async def create_document(
    document: DocumentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        db_document = Document(
            **document.dict(),
            owner_id=current_user.id
        )
        db.add(db_document)
        await db.commit()
        await db.refresh(db_document)
        return db_document
    except Exception as e:
        await db.rollback()
        error_traceback = traceback.format_exc()
        logger.error(f"Error creating document: {str(e)}\n{error_traceback}")
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred while creating the document: {str(e)}"
        )