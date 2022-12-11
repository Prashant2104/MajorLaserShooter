import React, { useEffect, useState, useRef } from "react";
import { redirecttoLandingPage } from "../../Constants/constants";
import ExperienceLoadingScreen from "../LoadingScreen/ExperienceLoadingScreen";
import ExperienceUI from "./ExperienceUI/ExperienceUI";
import Tutorial from "./ExperienceUI/UI_Components/Tutorial/Tutorial";
import Viewer from "./Viewer";

function Experience({ auth }) {
  const [percent, setpercent] = useState(0);
  const [isloading, setisloading] = useState(true);
  const [isExpLoading, setisExpLoading] = useState(false);
  const [openModal, setopenModal] = useState(false);
  const [width, setwidth] = useState(null);
  const [modalWidth, setmodalWidth] = useState("md");
  const [isiframe, setisiframe] = useState(false);
  const [fullScreen, setfullscreen] = useState(false);
  const [oniFrameClose, setoniFrameClose] = useState(null);
  const [score, setScore] = useState(0);

  const [modalContent, setmodalContent] = useState(
    <Tutorial
      score={score}
      onClose={() => {
        setopenModal(false);
      }}
    />
  );

  const [modalfullScreeen, setModalfullScreen] = useState(false);
  const [color, setcolor] = useState("#53B0AE");
  const [currentMesh, setcurrentMesh] = useState(null);

  useEffect(() => {
    redirecttoLandingPage(auth);
  }, []);

  const ref = useRef();
  const startAnim = (name) => {
    ref.current.startAnimation(name);
  };

  const takeSelfie = () => {
    ref.current.takeSelfie();
  };

  return (
    <div>
      <Viewer
        setScore={setScore}
        setopenModal={setopenModal}
        setModalfullScreen={setModalfullScreen}
        setcolor={setcolor}
        ref={ref}
        setpercent={setpercent}
        setisloading={setisloading}
        setcurrentMesh={setcurrentMesh}
        setisExpLoading={setisExpLoading}
        setmodalContent={setmodalContent}
        setisiframe={setisiframe}
        setmodalWidth={setmodalWidth}
      />
      {!isExpLoading && (
        <ExperienceUI
          isloading={isloading}
          startAnim={startAnim}
          takeSelfie={takeSelfie}
          setwidth={setwidth}
          width={width}
          currentMesh={currentMesh}
          isiframe={isiframe}
          setisiframe={setisiframe}
          fullScreen={fullScreen}
          setfullscreen={setfullscreen}
          oniFrameClose={oniFrameClose}
          setoniFrameClose={setoniFrameClose}
          setopenModal={setopenModal}
          openModal={openModal}
          modalWidth={modalWidth}
          setmodalWidth={setmodalWidth}
          modalContent={modalContent}
          setmodalContent={setmodalContent}
        />
      )}
      {/* <LoadingScreen percent={percent} isloading={isloading} /> */}
      {isExpLoading && <ExperienceLoadingScreen />}
    </div>
  );
}

export default Experience;
