import { useEffect, useState } from "react"
import { getSp } from "../Models/spSetup"


interface UseFetchResult<T>{
    data: T | null
    loading: boolean
    error: string | null
    refetch : () => void
}

const useFetchData =<T> (listTitle : string) : UseFetchResult<T> => {
    let sp = getSp()
    const [data, setData] = useState<T | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        fetchData()

    }, [listTitle])

    const refetch = () => {
        fetchData(); 
      };
    const fetchData = async () => {
        setLoading(true)
        setError(null)
        try{
            const listItems = await sp.web.lists.getByTitle("EmpList").items() as T;
              
            console.log(listItems)
            setData(listItems);
            console.log(listItems)
        }
        catch(err: any){
            setError(err.message)
        }
        finally{
            setLoading(false)
        }


}
return {data, loading, error, refetch}

}

export default useFetchData;
