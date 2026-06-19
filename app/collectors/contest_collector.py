from app.collectors.graphql_client import execute_query
from app.graphql.contest_queries import CONTEST_QUERY


def collect_contest_data(username):

    data = execute_query(
        CONTEST_QUERY,
        {"username": username}
    )

    contest_data = data["data"]["userContestRanking"]

    return {
        "current_rating": contest_data["rating"],
        "contests_attended": contest_data["attendedContestsCount"],
        "global_ranking": contest_data["globalRanking"],
        "top_percentage": contest_data["topPercentage"]
    }