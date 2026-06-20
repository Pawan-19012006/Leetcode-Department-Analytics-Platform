type Props = {

    contestName: string;

    participants: number;

    attended: number;

    notAttended: number;

    averageRank: number;

};

function ContestSummaryCard({

    contestName,

    participants,

    attended,

    notAttended,

    averageRank

}: Props) {

    return (

        <div
            className="
                bg-slate-900
                rounded-xl
                p-6
                border
                border-slate-800
                mt-6
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

            <div
                className="
                    grid
                    grid-cols-2
                    gap-4
                    text-slate-300
                "
            >

                <div>

                    Contest Name

                </div>

                <div>

                    {contestName}

                </div>

                <div>

                    Participants

                </div>

                <div>

                    {participants}

                </div>

                <div>

                    Attended

                </div>

                <div>

                    {attended}

                </div>

                <div>

                    Not Attended

                </div>

                <div className="text-red-400">

                    {notAttended}

                </div>

                <div>

                    Average Rank

                </div>

                <div>

                    {averageRank}

                </div>

            </div>

        </div>

    );

}

export default ContestSummaryCard;