import { AfterViewInit, Component, OnInit } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButton } from '@ionic/angular/standalone';
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
  ComponentBase
} from '@orillusion/core';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonButton],
})
export class HomePage implements OnInit, AfterViewInit{
  private light!: Object3D;
  constructor() {}

  ngOnInit() {
    
  }

  ngAfterViewInit(): void {
    this.startEngine().then(() => {
      const {scene, camera} = this.play();
      this.render(scene ,camera);
    });
  }

  async startEngine() {
    let canvas: HTMLCanvasElement = document.getElementById('canvas') as HTMLCanvasElement;
    await Engine3D.init({
      canvasConfig: {canvas}
    });
  }

  play() {
    let scene = new Scene3D();
    let sky = scene.addComponent(AtmosphericComponent);
    let cameraObj = new Object3D();
    let camera = cameraObj.addComponent(Camera3D);
    camera.perspective(60, window.innerWidth/window.innerHeight, 1, 5000);
    let controller = camera.object3D.addComponent(HoverCameraController);
    controller.setCamera(0, 0, 15);
    scene.addChild(cameraObj);

    this.light = new Object3D();
    let component = this.light.addComponent(DirectLight);
    this.light.rotationX = 45;
    this.light.rotationY = 30;
    component.intensity = 2;
    scene.addChild(this.light);

    const obj = new Object3D();
    let mr = obj.addComponent(MeshRenderer);
    mr.geometry = new BoxGeometry(5,1,4);
    mr.material = new LitMaterial();

    scene.addChild(obj);

    return {scene, camera};
  }

  render(scene: Scene3D, camera: Camera3D) {
    let view  = new View3D();
    view.scene = scene;
    view.camera = camera;
    Engine3D.startRenderView(view);
  }

  toggleLight() {
    const light = this.light.getComponent(DirectLight);
    light.enable = !light.enable;
  }
}
