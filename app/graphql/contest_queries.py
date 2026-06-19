CONTEST_QUERY = """
query userContestRankingInfo($username: String!) {

    userContestRanking(username: $username) {
        attendedContestsCount
        rating
        globalRanking
        topPercentage
    }

    userContestRankingHistory(username: $username) {
        attended
        trendDirection
        problemsSolved
        totalProblems
        finishTimeInSeconds
        rating
        ranking

        contest {
            title
            startTime
        }
    }
}
"""