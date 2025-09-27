import React from 'react'
import Image from "next/image";
import Link from "next/link";
const Login = () => {
  return (
     <div className="bg-[url(/bgimg.jpg)] flex items-center gap-6 justify-center flex-col h-[100vh]">
      <div className='flex flex-col gap-6'>
        <h1 className="text-white title text-6xl  leading-18 text-center font-bold ">
          AZƏRBAYCAN <br />
          MİNİATÜR SƏNƏTİ MUZEYİ
        </h1>
        <h2 className="text-[#4c2911] font-bold  title text-[53px] text-center">
          MUSEUM OF AZERBAIJANI MINIATURE ART
        </h2>
      </div>

      <Link
        href={"/puzzle"}
        className="text-white text-3xl title fkdk bg-[url('/button.png')] bg-center bg-cover px-18 py-4 rounded-xl mt-6"
      >
        BAŞLA / START
      </Link>
      <div className="flex flex-col mt-20 justify-center items-center">
        <span className="font-bold text-white text-xl text-shadow-lg">AZ</span>

        <p className="text-white title text-shadow-lg text-lg text-center">
         Oyun başladıqda miniatür təsviri kiçik hissələrə bölünmüş şəkildə görünəcək. <br />
Barmağınızla toxunaraq parçanı seçin. Doğru yerə sürüşdürərək yerləşdirin. <br />
Düzgün uyğunluq: Parça yerinə tam oturduqda səs və ya işıq effekti ilə təsdiqlənəcək.

        </p>
      </div>
     <div className="flex flex-col justify-center items-center">
       <span className="font-bold text-white text-xl text-shadow-lg">EN</span>
      <p className="text-white title text-shadow-lg text-lg text-center">
       When the game begins, the miniature image will appear divided into small pieces. <br />
Tap a piece with your finger to select it. Drag and place it in the correct spot. <br />
 When a piece is placed correctly, it will be confirmed with a sound or light effect.
      </p>
     </div>
    </div>
  )
}

export default Login