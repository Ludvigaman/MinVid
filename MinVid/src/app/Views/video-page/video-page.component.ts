import {
  Component,
  ElementRef,
  OnInit,
  OnDestroy,
  AfterViewChecked,
  ViewChild
} from '@angular/core';

import { VideoMetadata } from '../../Models/videoMetadata';
import { ActivatedRoute, Router } from '@angular/router';
import { FileServiceService } from '../../Services/file-service.service';
import { MatDialog } from '@angular/material/dialog';
import { EditComponent } from './edit/edit.component';

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

@Component({
  selector: 'app-video-page',
  standalone: false,
  templateUrl: './video-page.component.html',
  styleUrl: './video-page.component.scss'
})
export class VideoPageComponent
implements OnInit, OnDestroy, AfterViewChecked {

  @ViewChild('videoPlayer')
  videoplayer?: ElementRef;

  @ViewChild('video360')
  video360?: ElementRef<HTMLVideoElement>;

  @ViewChild('threeContainer')
  threeContainer?: ElementRef;

  paused = true;

  videoMetadata!: VideoMetadata;
  videoUrl = '';
  videoThumbnailUrl = '';
  videoFormat = '';

  recommendedVideos: VideoMetadata[] = [];
  recommendedThumbnails: string[] = [];

  unrestricted = false;
  is360 = false;
  show360poster = true;

  videoLoaded = false;
  viewerInitialized = false;

  scene!: THREE.Scene;
  camera!: THREE.PerspectiveCamera;
  renderer!: THREE.WebGLRenderer;
  controls!: OrbitControls;
  videoTexture!: THREE.VideoTexture;

  animationId = 0;

  private isDragging = false;
  private pointerMoved = false;

  constructor(
    private videoService: FileServiceService,
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog
  ) {}

  async ngOnInit() {

    const videoId =
      this.route.snapshot.paramMap.get('videoId') || '';

    this.unrestricted =
      localStorage.getItem("unrestricted") === "true";

    if (!videoId) return;

    this.videoService
      .getVideoMetadata(videoId)
      .subscribe((videoData: VideoMetadata) => {

        if (!videoData) {
          window.location.href = "/";
          return;
        }

        this.videoMetadata = videoData;

        document.addEventListener('fullscreenchange', this.onResize);
        window.addEventListener('resize', this.onResize);

        this.is360 = videoData.is360 || false;

        this.paused = true;

        this.videoThumbnailUrl =
          this.videoService.getThumbnailUrl(videoId);

        this.videoFormat =
          "video/" + videoData.format;

        this.videoUrl =
          this.videoService.getVideoUrl(videoId)
          + `?cb=${Date.now()}`;

        this.videoLoaded = true;
      });

    this.recommendedVideos =
      await this.videoService.getRecommended(
        videoId,
        this.unrestricted
      ) || [];

    this.recommendedVideos.forEach(v => {
      const thumb =
        this.videoService.getThumbnailUrl(v.id);

      this.recommendedThumbnails.push(thumb);
    });
  }

  ngAfterViewChecked() {

    if (
      this.is360 &&
      this.videoLoaded &&
      !this.viewerInitialized &&
      this.video360 &&
      this.threeContainer
    ) {
      this.viewerInitialized = true;
      this.init360Player();
    }
  }

  init360Player() {

    const video = this.video360?.nativeElement;
    const container = this.threeContainer?.nativeElement;

    if (!video || !container) return;

    video.crossOrigin = 'anonymous';
    video.playsInline = true;
    video.muted = false;
    video.loop = false;
    video.load();

    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(
      75,
      container.clientWidth / container.clientHeight,
      1,
      2000
    );

    this.camera.position.set(0, 0, 1);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(
      container.clientWidth,
      container.clientHeight
    );

    container.appendChild(this.renderer.domElement);

    const dom = this.renderer.domElement;

    dom.addEventListener('pointerdown', () => {
      this.pointerMoved = false;
    });

    dom.addEventListener('pointermove', () => {
      this.pointerMoved = true;
    });

    dom.addEventListener('pointerup', () => {
      setTimeout(() => {
        this.pointerMoved = false;
      }, 50);
    });

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableZoom = false;

    this.controls.addEventListener('end', () => {
      setTimeout(() => {
        this.isDragging = false;
      }, 50);
    });

    this.controls.target.set(-1, 0, 0);

    this.videoTexture = new THREE.VideoTexture(video);

    const geometry = new THREE.SphereGeometry(
      500,
      60,
      40,
      0,
      Math.PI,
      0,
      Math.PI
    );

    geometry.scale(-1, 1, 1);

    const material = new THREE.ShaderMaterial({
      uniforms: {
        map: { value: this.videoTexture },
        eye: { value: 0 }
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D map;
        uniform float eye;
        varying vec2 vUv;

        void main() {
          vec2 uv = vUv;
          uv.x *= 0.5;

          if (eye > 0.5) {
            uv.x += 0.5;
          }

          gl_FragColor = texture2D(map, uv);
        }
      `
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.y = -2.2;

    this.scene.add(mesh);

    this.animate();
  }

  onResize = () => {

    const container = this.is360
      ? this.threeContainer?.nativeElement
      : this.videoplayer?.nativeElement;

    if (!container || !this.camera || !this.renderer) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    if (height === 0 || width === 0) return;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(window.devicePixelRatio);
  };

  animate = () => {

    this.animationId = requestAnimationFrame(this.animate);

    this.controls?.update();

    if (this.videoTexture) {
      this.videoTexture.needsUpdate = true;
    }

    this.renderer?.render(this.scene, this.camera);
  };

  ngOnDestroy() {

    cancelAnimationFrame(this.animationId);
    document.removeEventListener('fullscreenchange', this.onResize);
    window.removeEventListener('resize', this.onResize);

    this.renderer?.dispose();
    this.videoTexture?.dispose();
  }
  
  play(event?: MouseEvent) {

    if (this.isDragging || this.pointerMoved) {
      return;
    }

    event?.stopPropagation();

    if (this.is360) {
      this.show360poster = false;

      const video = this.video360?.nativeElement;
      if (!video) return;

      if (this.paused) {
        video.play();
      } else {
        video.pause();
      }

      this.paused = !this.paused;
      return;
    }

    if (this.paused) {
      this.videoplayer?.nativeElement.play();
      this.paused = false;
    } else {
      this.videoplayer?.nativeElement.pause();
      this.paused = true;
    }
  }

  async edit() {
    const dialogRef =
      this.dialog.open(EditComponent, {
        data: this.videoMetadata,
        width: "80%"
      });

    dialogRef.afterClosed()
      .subscribe(async (result: VideoMetadata) => {

        const res =
          await this.videoService.updateVideoMetadata(result);

        if (res) {
          alert("Changes saved sucessfully...");
        }
      });
  }

  toggleFullscreen() {

    let element: HTMLElement | undefined;

    if (this.is360) {
      element = this.threeContainer?.nativeElement;
    } else {
      element = this.videoplayer?.nativeElement;
    }

    if (!element) return;

    const doc = document as any;

    if (!document.fullscreenElement) {

      element.requestFullscreen?.();

      // 🔥 force resize after layout updates
      setTimeout(() => {
        this.onResize();
      }, 50);

    } else {
      document.exitFullscreen?.();
    }
  }

  getRecThumbnail(videoId: string) {
    return this.recommendedThumbnails
      .find(t => t.includes(videoId));
  }

  capitalize(input: string) {
    if (!input) return '';

    return input
      .toLowerCase()
      .charAt(0)
      .toUpperCase() +
      input.toLowerCase().slice(1);
  }

  navigate(id: string) {
    window.location.href = "/video/" + id;
  }

  async delete(id: string) {

    const res = confirm(
      "Are you sure you want to delete this video?"
    );

    if (!res) return;

    const deleted =
      await this.videoService.delete(id);

    if (deleted) {
      alert("Video sucessfully deleted...");
      window.location.href = "/";
    }
  }
}