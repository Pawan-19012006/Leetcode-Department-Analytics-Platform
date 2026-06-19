import { useEffect, useState } from "react";

import DashboardLayout from "../layouts/DashboardLayout";

import api from "../services/api";

type Contest = {
    id: number;
    contest_name: string;
    contest_type: string;
    contest_number: number;
    contest_date: string;
};

type ContestResult = {

    rank: number;

    student_name: string;

    roll_no: string;

    leetcode_username: string;

    problems_solved: number;

    total_problems: number;

    finish_time_seconds: number;

    rating_after: number;

    rating_change: number;

};

function ContestPage() {

    const [contests, setContests] = useState<Contest[]>([]);

    const [selectedContest, setSelectedContest] =
        useState<number | null>(null);

    const [results, setResults] =
    useState<ContestResult[]>([]);

    useEffect(() => {

    const fetchContests = async () => {

        try {

            const response = await api.get(
                "/contests"
            );

            setContests(response.data);

        } catch (error) {

            console.error(
                "Failed to fetch contests",
                error
            );

        }

    };

    fetchContests();

}, []);

useEffect(() => {

    if (!selectedContest) return;

    const fetchResults = async () => {

        try {

            const response = await api.get(
                `/contests/${selectedContest}/results`
            );

            setResults(response.data);

        } catch (error) {

            console.error(
                "Failed to fetch results",
                error
            );

        }

    };

    fetchResults();

}, [selectedContest]);

    return (

        <DashboardLayout>

            <h1 className="text-white text-4xl font-bold mb-8">

                Contest Dashboard

            </h1>

            <select

                className="
                    bg-slate-800
                    text-white
                    p-3
                    rounded-lg
                    border
                    border-slate-700
                "

                value={selectedContest ?? ""}

                onChange={(e) =>
                    setSelectedContest(
                        Number(e.target.value)
                    )
                }

            >

                <option value="">

                    Select Contest

                </option>

                {contests.map((contest) => (

                    <option

                        key={contest.id}

                        value={contest.id}

                    >

                        {contest.contest_name}

                    </option>

                ))}

            </select>
            {selectedContest && (

                <div className="mt-6">

                    <p className="text-slate-300 mb-4">

                        Selected Contest ID:
                        {" "}
                        {selectedContest}

                    </p>

                    <pre className="text-white">

                        {JSON.stringify(results, null, 2)}

                    </pre>

                </div>

            )}
        </DashboardLayout>

    );

}

export default ContestPage;