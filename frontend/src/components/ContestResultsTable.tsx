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

type Props = {

    results: ContestResult[];

};

function ContestResultsTable({

    results

}: Props) {

    return (

        <div className="mt-8 overflow-x-auto">

            <table className="w-full text-white">

                <thead>

                    <tr className="border-b border-slate-700">

                        <th className="text-left p-4">

                            Rank

                        </th>

                        <th className="text-left p-4">

                            Student

                        </th>

                        <th className="text-left p-4">

                            Roll No

                        </th>

                        <th className="text-left p-4">

                            Solved

                        </th>

                        <th className="text-left p-4">

                            Rating Change

                        </th>

                    </tr>

                </thead>

                <tbody>

                    {results.map((result) => (

                        <tr

                            key={result.roll_no}

                            className="
                                border-b
                                border-slate-800
                                hover:bg-slate-900
                            "
                        >

                            <td className="p-4">

                                {result.rank}

                            </td>

                            <td className="p-4">

                                {result.student_name}

                            </td>

                            <td className="p-4">

                                {result.roll_no}

                            </td>

                            <td className="p-4">

                                {result.problems_solved}
                                /
                                {result.total_problems}

                            </td>

                            <td className="p-4">

                                {result.rating_change.toFixed(2)}

                            </td>

                        </tr>

                    ))}

                </tbody>

            </table>

        </div>

    );

}

export default ContestResultsTable;