import { AfterViewInit, Component, OnInit } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
} from '@ionic/angular/standalone';
import {
  Color,
  Engine3D,
  Scene3D,
  Object3D,
  Camera3D,
  View3D,
  LitMaterial,
  BoxGeometry,
  MeshRenderer,
  DirectLight,
  HoverCameraController,
  AtmosphericComponent,
  ComponentBase,
  SolidColorSky,
  SkyRenderer,
  Time,
  Vector3,
  FlyCameraController,
  OrbitController,
} from '@orillusion/core';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonButton],
})
export class HomePage implements OnInit, AfterViewInit {
  private light!: Object3D;
  private renderState = false;

  constructor() {}

  ngOnInit() {}

  ngAfterViewInit(): void {
    this.startEngine().then(() => {
      const { scene, camera } = this.play();
      this.render(scene, camera);
    });
  }

  async startEngine() {
    this.configureEngine();
    let canvas: HTMLCanvasElement = document.getElementById(
      'canvas'
    ) as HTMLCanvasElement;
    await Engine3D.init({
      canvasConfig: {
        canvas,
        // alpha: true,
        devicePixelRatio: 1,
      },
    });
  }

  play() {
    let scene = new Scene3D();
    // let sky = scene.addComponent(AtmosphericComponent);
    // sky.sunBrightness = 0.2;
    let colorSky = new SolidColorSky(new Color(0.5, 1, 0.8, 1));
    let sky = scene.addComponent(SkyRenderer);
    sky.map = colorSky;
    scene.envMap = colorSky;
    sky.enable = false;

    let cameraObj = new Object3D();
    let camera = cameraObj.addComponent(Camera3D);

    camera.perspective(60, window.innerWidth / window.innerHeight, 1, 100);
    // camera.orthoOffCenter(400, 400, 400 , 400, 20, 20);

    let controller = camera.object3D.addComponent(HoverCameraController);
    controller.setCamera(0, -20, 15);
    // let controller = camera.object3D.addComponent(FlyCameraController);
    // controller.setCamera(new Vector3(0, 0, 15), new Vector3(0, 0, 0));
    // let controller = camera.object3D.addComponent(OrbitController);
    // cameraObj.localPosition.set(0, 10, 10);
    // controller.autoRotate = true;
    // controller.autoRotateSpeed = 1;

    // cameraObj.z = -20;
    // cameraObj.y = 10;
    // cameraObj.rotationX = 30;

    // camera.lookAt(new Vector3(10, 0, -60), new Vector3(0, 0,0), new Vector3(0, 0,1));
    scene.addChild(cameraObj);

    this.light = new Object3D();
    let component = this.light.addComponent(DirectLight);
    this.light.rotationX = 45;
    this.light.rotationY = 30;
    component.intensity = 5;
    scene.addChild(this.light);
    this.light.addComponent(LightAnimation);

    const obj = new Object3D();
    let mr = obj.addComponent(MeshRenderer);
    mr.geometry = new BoxGeometry(5, 1, 4);
    mr.material = new LitMaterial();
    obj.y = 2;
    obj.rotationX = 10;
    obj.scaleX = 1.2;
    // obj.addComponent(Script);
    obj.addComponent(MaterialAnimation);
    // obj.addComponent(PathAnimation);

    scene.addChild(obj);

    return { scene, camera };
  }

  render(scene: Scene3D, camera: Camera3D) {
    let view = new View3D();
    view.scene = scene;
    view.camera = camera;
    Engine3D.startRenderView(view);
    this.renderState = true;
  }

  toggleLight() {
    const light = this.light.getComponent(DirectLight);
    light.enable = !light.enable;
  }

  toggleRendering() {
    if (this.renderState) {
      Engine3D.pause();
    } else {
      Engine3D.resume();
    }
    this.renderState = !this.renderState;
  }

  configureEngine() {
    Engine3D.setting.light.maxLight = 1024;
    Engine3D.setting.render.useLogDepth = true;
    Engine3D.setting.pick.enable = true;
    Engine3D.setting.pick.mode = 'pixel';
    Engine3D.setting.shadow.enable = true;
  }
}

class Script extends ComponentBase {
  override start() {
    // console.log(this.object3D);
  }

  override onUpdate() {
    this.object3D.rotationY += 1;
  }
}

class LightAnimation extends ComponentBase {
  private light!: DirectLight;
  private color!: Color;

  override start() {
    this.light = this.object3D.getComponent(DirectLight);
    this.color = this.light.lightColor;
  }

  override onUpdate() {
    this.color.g = Math.pow(Math.sin(Time.time * 0.001), 10);
    this.light.lightColor = this.color;
  }
}

class MaterialAnimation extends ComponentBase {
  private material!: LitMaterial;

  override start() {
    let mr = this.object3D.getComponent(MeshRenderer);
    this.material = mr.material as LitMaterial;
  }

  override onUpdate() {
    let delta = Time.time * 0.001;
    this.material.baseColor = new Color(
      Math.sin(delta),
      Math.cos(delta),
      Math.sin(delta)
    );
  }
}

class PathAnimation extends ComponentBase {
  override onUpdate() {
    this.object3D.x = Math.sin(Time.time * 0.001) * 2;
    this.object3D.y = Math.cos(Time.time * 0.001) * 2;
  }
}
