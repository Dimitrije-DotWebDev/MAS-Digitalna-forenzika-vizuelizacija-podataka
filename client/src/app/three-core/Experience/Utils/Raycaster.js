import * as THREE from 'three';
import EventEmitter from './EventEmitter.js';
import Experience from '../Experience.js';

export default class Raycaster extends EventEmitter {
    constructor() {
        super();

        this.experience = new Experience();
        this.camera = this.experience.camera.instance;
        this.scene = this.experience.scene;
        this.canvas = this.experience.canvas;
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.currentIntersect = null;

        this.onMouseMove = (event) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        };

        window.addEventListener('mousemove', this.onMouseMove);

        this.onClick = () => {
            if (this.currentIntersect) {
                this.trigger('click', [this.currentIntersect.object]);
            }
        };
        window.addEventListener('click', this.onClick);
    }

    update() {
        this.raycaster.setFromCamera(this.mouse, this.camera);

        const objectsToTest = [];
        this.scene.traverse((child) => {
            if (child.isMesh && child.userData.isPlanet) {
                objectsToTest.push(child);
            }
        });

        const intersects = this.raycaster.intersectObjects(objectsToTest);

        if (intersects.length) {
            const closestObject = intersects[0].object;

            if (!this.currentIntersect || this.currentIntersect !== closestObject) {
                
                // 🚨 POPRAVKA 1: Ako prelazimo sa jedne planete na drugu, prosleđujemo staru u hoverOut
                if (this.currentIntersect) {
                    this.trigger('hoverOut', [this.currentIntersect]);
                }

                this.currentIntersect = closestObject;
                this.trigger('hoverIn', [this.currentIntersect]);
                this.canvas.style.cursor = 'pointer';
            }
        } else {
            // 🚨 POPRAVKA 2: Kada miš potpuno ode sa planeta, prosleđujemo tu poslednju aktivnu planetu da se skupi
            if (this.currentIntersect) {
                this.trigger('hoverOut', [this.currentIntersect]);
                this.canvas.style.cursor = 'default';
            }
            this.currentIntersect = null;
        }
    }

    destroy() {
        window.removeEventListener('mousemove', this.onMouseMove);
        window.removeEventListener('click', this.onClick);
    }
}