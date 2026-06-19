from app.collectors.graphql_client import execute_query

from app.graphql.profile_queries import PROFILE_QUERY


data = execute_query(
    PROFILE_QUERY,
    {
        "username": "pawaneswaran19"
    }
)

print(data)