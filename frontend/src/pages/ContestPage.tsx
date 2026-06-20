import { useEffect, useState } from "react";

import DashboardLayout from "../layouts/DashboardLayout";

import api from "../services/api";

import ContestResultsTable from "../components/ContestResultsTable";

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

    const [contestType, setContestType] =
        useState("weekly");

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

const filteredContests =
    contests.filter(
        (contest) =>
            contest.contest_type
                .toLowerCase()
                === contestType
    );

    return (

        <DashboardLayout>

            <h1 className="text-white text-4xl font-bold mb-8">

                Contest Dashboard

            </h1>

            <div className="flex gap-4 mb-6">

    <button

        onClick={() =>

            setContestType("weekly")

        }

        className={`

            px-6

            py-2

            rounded-lg

            ${

                contestType === "weekly"

                    ? "bg-orange-500 text-white"

                    : "bg-slate-800 text-slate-300"

            }

        `}

    >

        Weekly

    </button>

    <button

        onClick={() =>

            setContestType("biweekly")

        }

        className={`

            px-6

            py-2

            rounded-lg

            ${

                contestType === "biweekly"

                    ? "bg-orange-500 text-white"

                    : "bg-slate-800 text-slate-300"

            }

        `}

    >

        Biweekly

    </button>

</div>

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

                {filteredContests.map((contest) => (

                    <option

                        key={contest.id}

                        value={contest.id}

                    >

                        {contest.contest_name}

                    </option>

                ))}

            </select>
{selectedContest && (

    <div

        className="

            mt-6

            bg-slate-900

            border

            border-slate-800

            rounded-xl

            p-6

            max-w-2xl

        "

    >

        <h2

            className="

                text-xl

                font-semibold

                text-white

                mb-4

            "

        >

            Contest Summary

        </h2>

        <div className="grid grid-cols-2 gap-4">

            <div>

                <p className="text-slate-400">

                    Contest Name

                </p>

                <p className="text-white">

                    {

                        contests.find(

                            c => c.id === selectedContest

                        )?.contest_name

                    }

                </p>

            </div>

            <div>

                <p className="text-slate-400">

                    Participants

                </p>

                <p className="text-white">

                    1

                </p>

            </div>

            <div>

                <p className="text-slate-400">

                    Attended

                </p>

                <p className="text-green-400">

                    1

                </p>

            </div>

            <div>

                <p className="text-slate-400">

                    Not Attended

                </p>

                <p className="text-red-400">

                    0

                </p>

            </div>

        </div>

        <div className="mt-8 flex gap-4">

    <input

        type="text"

        placeholder="Search Student"

        className="
            bg-slate-900
            border
            border-slate-800
            rounded-lg
            px-4
            py-3
            text-white
            w-80
        "

    />

    <select

        className="
            bg-slate-900
            border
            border-slate-800
            rounded-lg
            px-4
            py-3
            text-white
        "

    >

        <option>

            All Years

        </option>

        <option>

            1st Year

        </option>

        <option>

            2nd Year

        </option>

        <option>

            3rd Year

        </option>

        <option>

            4th Year

        </option>

    </select>

</div>

    </div>

    

)}

{results.length > 0 && (

    <div>

        <h2

            className="
                text-white
                text-2xl
                font-semibold
                mt-8
                mb-4
            "

        >

            Department Rankings

        </h2>

        <ContestResultsTable
            results={results}
        />

    </div>

)}
        </DashboardLayout>

    );

}

export default ContestPage;