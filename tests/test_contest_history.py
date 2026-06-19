# tests/test_contest_history.py

from app.collectors.graphql_client import execute_query
from app.graphql.contest_queries import CONTEST_QUERY

data = execute_query(
    CONTEST_QUERY,
    {"username": "pawaneswaran19"}
)

history = data["data"]["userContestRankingHistory"]

print(history[0])