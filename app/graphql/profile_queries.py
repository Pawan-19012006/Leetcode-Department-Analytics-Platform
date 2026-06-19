

PROFILE_QUERY = """

query getUserProfile($username: String!) {

    matchedUser(username: $username) {

        username

        profile {

            ranking

        }

        submitStats {

            acSubmissionNum {

                difficulty

                count

            }

        }

    }

}

"""