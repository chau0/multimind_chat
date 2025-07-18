from pydantic import BaseModel, Field
from typing import Optional

class Agent(BaseModel):
    id: int
    name: str = Field(..., max_length=255)
    description: str = Field(..., max_length=500)
    system_prompt: Optional[str] = None
    
    # Frontend display properties (computed or defaults)
    display_name: Optional[str] = None
    avatar: Optional[str] = None
    color: Optional[str] = None

    class Config:
        orm_mode = True
    
    @property
    def computed_display_name(self) -> str:
        """Compute display name if not provided."""
        return self.display_name or self.name
    
    @property
    def computed_avatar(self) -> str:
        """Compute avatar emoji/character from name."""
        return self.avatar or self.name[0].upper()
    
    @property
    def computed_color(self) -> str:
        """Compute color gradient based on name hash."""
        if self.color:
            return self.color
        
        # Generate consistent color based on name
        hash_val = abs(hash(self.name)) % 8
        colors = [
            "from-blue-500 to-blue-600",
            "from-green-500 to-green-600", 
            "from-purple-500 to-purple-600",
            "from-red-500 to-red-600",
            "from-yellow-500 to-yellow-600",
            "from-indigo-500 to-indigo-600",
            "from-pink-500 to-pink-600",
            "from-teal-500 to-teal-600"
        ]
        return colors[hash_val]

class AgentCreate(BaseModel):
    name: str = Field(..., max_length=255)
    description: str = Field(..., max_length=500)
    system_prompt: Optional[str] = None
    display_name: Optional[str] = None
    avatar: Optional[str] = None
    color: Optional[str] = None
