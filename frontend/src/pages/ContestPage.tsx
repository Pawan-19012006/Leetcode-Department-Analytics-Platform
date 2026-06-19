import { useEffect, useState } from "react";
import api from "../services/api";

function ContestPage() {

  const [contests, setContests] = useState([]);

  useEffect(() => {

    api.get("/contests")
      .then((response) => {

        console.log(response.data);

        setContests(response.data);

      })
      .catch((error) => {

        console.error(error);

      });

  }, []);

  return (

    <div>

      <h1>Contest Dashboard</h1>

      <pre>
        {JSON.stringify(contests, null, 2)}
      </pre>

    </div>

  );
}

export default ContestPage;