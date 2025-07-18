from app.utils.db import SessionLocal
from app.models.chat import Agent

def seed_agents():
    db = SessionLocal()
    agents = [
        Agent(name="Echo", description="A simple agent that echoes your message."),
        Agent(name="Reverse", description="A simple agent that reverses your message.")
    ]
    for agent in agents:
        db.add(agent)
    db.commit()
    db.close()

if __name__ == "__main__":
    seed_agents()
