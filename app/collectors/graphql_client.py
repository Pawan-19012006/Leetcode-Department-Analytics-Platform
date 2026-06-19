import requests


LEETCODE_GRAPHQL_URL = "https://leetcode.com/graphql"


def execute_query(query, variables): # We have created this function to push all the queries to Leetcode Graphql endpoint by using this function in the collectors

    response = requests.post(
        LEETCODE_GRAPHQL_URL,

        json={
            "query": query,
            "variables": variables
        },

        timeout=30
    )

    response.raise_for_status()

    return response.json()