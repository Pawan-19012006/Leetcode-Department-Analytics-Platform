from app.collectors.graphql_client import execute_query

from app.graphql.profile_queries import PROFILE_QUERY

#This will create and post the query to the leetcode endpoint using the execute query function, then the recieved data will be properly collected and stored in a proper format
def collect_profile(username):
    data = execute_query(
        PROFILE_QUERY,
        {"username" : username}
    )

    user = data["data"]["matchedUser"]
    submissions = user["submitStats"]["acSubmissionNum"]
    total_solved = submissions[0]["count"]
    easy_solved = submissions[1]["count"]
    medium_solved = submissions[2]["count"]
    hard_solved = submissions[3]["count"]

    return{
        "leetcode_username": user["username"],

        "global_rank": user["profile"]["ranking"],

        "total_solved": total_solved,

        "easy_solved": easy_solved,

        "medium_solved": medium_solved,

        "hard_solved": hard_solved,
    }