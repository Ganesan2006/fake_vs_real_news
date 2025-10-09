from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.app.models import schemas, database_models
from backend.app.database.database import get_db
from backend.app.services.ai_service import AIService
import json

router = APIRouter(prefix="/api/roadmap", tags=["roadmap"])

@router.post("/generate")
async def generate_roadmap(roadmap_data: schemas.RoadmapGenerate, user_id: int, db: Session = Depends(get_db)):
    user = db.query(database_models.User).filter(database_models.User.id == user_id).first()
    
    # Generate AI roadmap
    ai_response = await AIService.generate_roadmap(
        {"background": user.background, "current_role": user.current_role, "skills": user.skills},
        roadmap_data.goal,
        roadmap_data.tech_stack
    )
    
    # Create roadmap
    roadmap = database_models.Roadmap(
        user_id=user_id,
        goal=roadmap_data.goal,
        tech_stack=roadmap_data.tech_stack
    )
    db.add(roadmap)
    db.commit()
    
    # Parse and create modules (simplified)
    modules_data = json.loads(ai_response)
    for idx, module in enumerate(modules_data.get('modules', [])):
        db_module = database_models.Module(
            roadmap_id=roadmap.id,
            title=module['title'],
            description=module['description'],
            difficulty=module['difficulty'],
            estimated_hours=module['estimated_hours'],
            order=idx
        )
        db.add(db_module)
    
    db.commit()
    return {"message": "Roadmap generated", "roadmap_id": roadmap.id}

@router.get("/{user_id}")
def get_roadmap(user_id: int, db: Session = Depends(get_db)):
    roadmaps = db.query(database_models.Roadmap).filter(database_models.Roadmap.user_id == user_id).all()
    return roadmaps
