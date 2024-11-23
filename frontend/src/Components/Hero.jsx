import Upload_comp from './Upload_comp'

const Hero = () => {
  return (
    <div className="w-[80%] overflow-y-scroll h-full font-primaryFontFamily px-5 py-10 flex flex-col gap-10">
    <div className="relative flex  items-center justify-center flex-col w-full p-5 gap-4 ">
      <h1 className="text-5xl font-semibold ">
        Chat with any
        <span className="bg-primary p-2 text-white rounded-lg ml-2">
          PDF
        </span>
      </h1>
      <p className="w-1/2 text-center">
        Join millions of students, researchers and professionals to
        instantly answer questions and understand research with AI.
      </p>
    </div>
    <div className="flex w-full items-center justify-center">
      <Upload_comp />
    </div>
  </div>
  )
}

export default Hero
