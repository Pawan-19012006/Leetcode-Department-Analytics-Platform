from app.collectors.profile_collector import collect_profile
from app.collectors.contest_collector import collect_contest_data

# Will merge the data from the profile collector and the contest data collector
def build_profile_snapshot(username):

    profile_data = collect_profile(username)

    contest_data = collect_contest_data(username)

    snapshot = {
        "current_rating": contest_data["current_rating"],

        "global_rank": profile_data["global_rank"],

        "contests_attended": contest_data["contests_attended"],

        "total_solved": profile_data["total_solved"],
        "easy_solved": profile_data["easy_solved"],
        "medium_solved": profile_data["medium_solved"],
        "hard_solved": profile_data["hard_solved"],

        "top_percentage": contest_data["top_percentage"]
    }

    return snapshot