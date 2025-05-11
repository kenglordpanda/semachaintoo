# This file is kept for backward compatibility
# It now redirects to the PyMilvus-based vector_service implementation

from .vector_service import vector_service

# Re-export the vector_service singleton as vector_db for backward compatibility
vector_db = vector_service