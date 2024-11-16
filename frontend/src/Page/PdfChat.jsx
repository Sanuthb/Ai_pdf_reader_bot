import React from 'react'
import Chat_comp from '../Components/Chat_comp'
import { useSetRecoilState } from 'recoil'
import { selectedPDFAtom } from '../Atoms/atoms'
import { useParams } from 'react-router-dom'
const PdfChat = () => {

  const setSelectedPdf = useSetRecoilState(selectedPDFAtom)
  const {filename} = useParams()
  
  React.useEffect(() => {
    setSelectedPdf(filename);
  }, [setSelectedPdf]);
  return (
    <div className="font-primaryFontFamily flex w-[85%] h-screen">
        <Chat_comp/>
    </div>
  )
}

export default PdfChat
