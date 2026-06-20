from app.collectors.graphql_client import execute_query

from app.graphql.contest_queries import CONTEST_QUERY


data = execute_query(

    CONTEST_QUERY,

    {

        "username": "pawaneswaran19"

    }

)

history = data["data"]["userContestRankingHistory"]

for contest in history:

    print()

    print(
        contest["contest"]["title"]
    )

    print(
        "Rank:",
        contest["ranking"]
    )

    print(
        "Solved:",
        contest["problemsSolved"]
    )

    print(
        "Rating:",
        contest["rating"]
    )