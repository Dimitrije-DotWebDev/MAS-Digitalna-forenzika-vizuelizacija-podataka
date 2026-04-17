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

        // Čuvamo referencu na funkciju da bismo mogli da je uklonimo u destroy()
        this.onMouseMove = (event) => {
            // Uzimamo tačne dimenzije i poziciju kanvasa na ekranu u svakom trenutku
            const rect = this.canvas.getBoundingClientRect();

            /**
             * Kalkulacija normalizovanih koordinata miša UNUTAR kanvasa:
             * 1. (event.clientX - rect.left) -> pozicija miša u pikselima od leve ivice kanvasa
             * 2. (... / rect.width) -> pretvara u opseg [0, 1]
             * 3. (... * 2 - 1) -> pretvara u normalizovani Three.js opseg [-1, 1]
             */
            this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        };

        window.addEventListener('mousemove', this.onMouseMove);

        // Opciono: Klik događaj za buduće potrebe
        this.onClick = () => {
            if (this.currentIntersect) {
                this.trigger('click', [this.currentIntersect.object]);
            }
        };
        window.addEventListener('click', this.onClick);
    }

    /**
     * Glavna logika za detekciju kolizije (presecanja zraka i objekata)
     */
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

            // --- KLJUČNA PROMENA ---
            // Ako nismo imali presek ILI ako je novi presek drugačiji od starog
            if (!this.currentIntersect || this.currentIntersect !== closestObject) {
                
                // Ako prelazimo direktno sa jednog na drugi, prvo "odjavi" stari
                if (this.currentIntersect) {
                    this.trigger('hoverOut');
                }

                // Prijavi novi hover
                this.currentIntersect = closestObject;
                this.trigger('hoverIn', [this.currentIntersect]);
                this.canvas.style.cursor = 'pointer';
            }
        } else {
            if (this.currentIntersect) {
                this.trigger('hoverOut');
                this.canvas.style.cursor = 'default';
            }
            this.currentIntersect = null;
        }
    }

    /**
     * Čišćenje resursa pri gašenju komponente
     */
    destroy() {
        window.removeEventListener('mousemove', this.onMouseMove);
        window.removeEventListener('click', this.onClick);
    }
}