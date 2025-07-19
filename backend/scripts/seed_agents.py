from app.utils.db import SessionLocal
from app.models.chat import Agent

def seed_agents():
    db = SessionLocal()
    try:
        # Check if agents already exist
        existing_agents = db.query(Agent).count()
        if existing_agents > 0:
            print(f"Database already has {existing_agents} agents. Skipping seed.")
            return
            
        agents = [
            Agent(
                name="Assistant", 
                description="A helpful AI assistant that can answer questions and provide information.",
                display_name="AI Assistant",
                avatar="AI",
                color="from-blue-500 to-purple-600"
            ),
            Agent(
                name="Coder", 
                description="A programming expert that can help with code, debugging, and technical solutions.",
                display_name="Code Expert",
                avatar="CODE",
                color="from-green-500 to-blue-600"
            ),
            Agent(
                name="Writer", 
                description="A creative writing assistant that helps with content creation and editing.",
                display_name="Creative Writer",
                avatar="WRITE",
                color="from-purple-500 to-pink-600"
            ),
            Agent(
                name="Researcher", 
                description="A research specialist that provides detailed analysis and factual information.",
                display_name="Research Analyst",
                avatar="RSRCH",
                color="from-orange-500 to-red-600"
            )
        ]
        for agent in agents:
            db.add(agent)
        db.commit()
        print(f"Successfully seeded {len(agents)} agents.")
    except Exception as e:
        print(f"Error seeding agents: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_agents()
