from app.collectors.graphql_client import execute_query
from app.graphql.contest_queries import CONTEST_QUERY


def collect_contest_history(username):

    data = execute_query(
        CONTEST_QUERY,
        {"username": username}
    )

    history = data["data"]["userContestRankingHistory"]

    return history