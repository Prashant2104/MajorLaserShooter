import React, { Component } from "react";
import * as BABYLON from "babylonjs";
import "babylonjs-loaders";

import BabylonScene from "./Scene";
import type { SceneEventArgs } from "./Scene";
import { SceneLoader } from "babylonjs";
import { retargetAnims } from "./Player";

type Props = {};

class AvatarCustomiser extends Component<Props, {}> {
  constructor(props) {
    super(props);

    this.canvas = "";
    this.engine = "";
    this.scene = "";
    this.camera = "";
    this.light = "";
    this.state = {};

    this.data = "";

    this.genders = [
      {
        root: "",
      },
      {
        root: "",
      },
    ];

    this.previousProps = {
      Gender: 0,
      Beard: 0,
      Eyeglass: 0,
      Hair: 0,
      Top: 0,
      Bottom: 0,
      skinColor: "#B87352",
    };
    this.Holder = "";
  }
  onSceneMount = (e: SceneEventArgs) => {
    const { canvas, scene, engine } = e;
    this.canvas = canvas;
    this.engine = engine;
    this.scene = scene;

    this.setupCamera();
    this.setupLights();
    this.loadModel();
    engine.hideLoadingUI();

    engine.runRenderLoop(() => {
      if (scene) {
        scene.render();
      }
    });
  };

  setupCamera = () => {
    this.camera = new BABYLON.ArcRotateCamera(
      "Camera",
      1.57,
      1.3,
      4.2,
      new BABYLON.Vector3(0, 1.7, 0),
      this.scene
    );
    this.camera.attachControl(this.canvas, false);
    this.camera.fov = 1;
    this.camera.minZ = 0;
    this.camera.upperRadiusLimit = 4.2;
    this.camera.lowerRadiusLimit = 4.2;
  };

  resetCamera = () => {
    this.camera.alpha = 1.57;
    this.camera.beta = 1.3;
  };

  fetchData = () => {
    fetch("/avatarData.json", {})
      .then((res) => res.json())
      .then((data) => {
        this.data = data;
      });
  };

  setupLights = () => {
    const light = new BABYLON.HemisphericLight(
      "light1",
      new BABYLON.Vector3(0, 1, 0),
      this.scene
    );
    light.intensity = 1.5;
    this.scene.clearColor = BABYLON.Color3.White();
  };

  loadModel = () => {
    SceneLoader.ImportMesh(
      "",
      "/",
      "Male_Crew_Spicejet.glb",
      this.scene,
      (mesh, particleSystems, skeleton, animationGroups) => {
        this.genders[0].root = mesh[0];
        mesh[0].position = new BABYLON.Vector3(0, 0, 0);
        mesh[0].rotation = new BABYLON.Vector3(0, Math.PI, 0);
        mesh[0].scaling = new BABYLON.Vector3(2, 2, -2);
        mesh[0].animations.push(...animationGroups);

        this.playIdleAnim(animationGroups);

        const shadow = BABYLON.MeshBuilder.CreateDisc(
          "shadow",
          { radius: 0.5 },
          this.scene
        );
        shadow.parent = mesh[0];
        shadow.rotation = new BABYLON.Vector3(Math.PI / 2, Math.PI, 0);
        const shadowMat = new BABYLON.StandardMaterial("shadowMat", this.scene);
        shadow.material = shadowMat;
        this.Holder = mesh[0];
        // this.resetCharacter();

        // this.scene.debugLayer.show();
      }
    );

    SceneLoader.ImportMesh(
      "",
      "/",
      "Female_Crew_Spicejet.glb",
      this.scene,
      (mesh, particleSystems, skeleton, animationGroups) => {
        this.genders[1].root = mesh[0];
        mesh[0].setEnabled(false);

        mesh[0].position = new BABYLON.Vector3(0, 0, 0);
        mesh[0].rotation = new BABYLON.Vector3(0, Math.PI, 0);
        mesh[0].scaling = new BABYLON.Vector3(2, 2, -2);
        mesh[0].animations.push(...animationGroups);

        this.playIdleAnim(animationGroups);

        const shadow = BABYLON.MeshBuilder.CreateDisc(
          "shadow",
          { radius: 0.5 },
          this.scene
        );
        shadow.parent = mesh[0];
        shadow.rotation = new BABYLON.Vector3(Math.PI / 2, Math.PI, 0);
        const shadowMat = new BABYLON.StandardMaterial("shadowMat", this.scene);
        shadow.material = shadowMat;
        // this.resetCharacter();
      }
    );
  };

  playIdleAnim = (animGroups) => {
    const idle = animGroups.find((anim) => anim.name === "BREATHING_ANIM");
    idle.play(true);
  };

  resetCharacter = () => {
    const meshes = this.Holder._children[0].getChildren();
    meshes.forEach((ch_mesh) => {
      switch (ch_mesh.name.split("_")[0]) {
        case "Hair":
          ch_mesh.setEnabled(false);
          if (ch_mesh.name.split("_")[1] == 0) {
            ch_mesh.setEnabled(true);
          }
          break;
        case "Top":
          ch_mesh.setEnabled(false);
          if (ch_mesh.name.split("_")[1] == 0) {
            ch_mesh.setEnabled(true);
          }
          break;
        case "Bottom":
          ch_mesh.setEnabled(false);
          if (ch_mesh.name.split("_")[1] == 0) {
            ch_mesh.setEnabled(true);
          }
          break;
        case "Eyeglass":
          ch_mesh.setEnabled(false);
          if (ch_mesh.name.split("_")[1] == 0) {
            ch_mesh.setEnabled(true);
          }
          break;
        case "Beard":
          ch_mesh.setEnabled(false);
          if (ch_mesh.name.split("_")[1] == 0) {
            ch_mesh.setEnabled(true);
          }
          break;
      }
    });
  };

  stopBabylonRenderLoop = () => {
    this.engine.stopRenderLoop();
  };

  switchProps = (propName, i) => {
    if (propName === "Gender") {
      this.genders[i].root.setEnabled(true);
      this.Holder.setEnabled(false);
      this.Holder = this.genders[i].root;
      this.resetCharacter();
      return;
    }
    this.Holder._children[0].getChildren().forEach((mesh) => {
      if (mesh.name == `${propName}_${this.previousProps[propName]}`) {
        mesh.setEnabled(false);
      }
    });
    this.Holder._children[0].getChildren().forEach((mesh) => {
      if (mesh.name === `${propName}_${i}`) {
        mesh.setEnabled(true);
        this.previousProps[propName] = i;
      }
    });
  };

  changeSkinColor = (color) => {
    this.Holder.getChildMeshes().forEach((mesh) => {
      if (mesh.name.includes("BASE")) {
        mesh.material.albedoColor =
          BABYLON.Color3.FromHexString(color).toLinearSpace();
      }
    });
  };

  render() {
    return <BabylonScene id="model_Render" onSceneMount={this.onSceneMount} />;
  }
}

export default AvatarCustomiser;
