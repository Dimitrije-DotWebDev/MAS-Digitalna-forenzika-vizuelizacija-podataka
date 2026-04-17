import * as THREE from 'three';
import Experience from '../Experience.js';
import Raycaster from '../Utils/Raycaster.js'

export default class RadarSystem {
    constructor() {
        this.experience = new Experience();
        this.scene = this.experience.scene;
        this.container = new THREE.Group();
        this.scene.add(this.container);

        this.planets = [];
        this.setSun();
        this.isPaused = false;
        this.tooltipElement = null;
        this.setupRaycaster();
    }

    setupRaycaster() {
        this.raycaster = new Raycaster();

        this.raycaster.on('hoverIn', (planetMesh) => {
            this.isPaused = true;

            if (!planetMesh.userData.isZoomed) {
                planetMesh.scale.multiplyScalar(1.5);
                planetMesh.userData.isZoomed = true;
            }

            planetMesh.material.emissiveIntensity = 5.0; 
            
            // Koristimo .info koji smo spremili u addPlanetToSystem
            const data = planetMesh.userData.info;
            this.showTooltip(data);
            
            document.body.style.cursor = 'pointer';
        });

        this.raycaster.on('hoverOut', () => {
            this.isPaused = false;
            this.hideTooltip();
            document.body.style.cursor = 'default';

            this.planets.forEach(p => {
                const mesh = p.group.children[0];
                if (mesh.userData.isZoomed) {
                    mesh.scale.divideScalar(1.5);
                    mesh.userData.isZoomed = false;
                }
                mesh.material.emissiveIntensity = 1.2;
            });
        });
    }

    setSun() {
        this.sunGeometry = new THREE.IcosahedronGeometry(4.6, 15);
        this.sunMaterial = new THREE.MeshStandardMaterial({
            color: '#ffaa00',
            emissive: '#ff6600',
            emissiveIntensity: 10,
            roughness: 0.5,
            metalness: 0
        });
        this.sun = new THREE.Mesh(this.sunGeometry, this.sunMaterial);
        this.container.add(this.sun);

        this.sunLight = new THREE.PointLight('#ffddaa', 400, 1000); 
        this.container.add(this.sunLight);
    }

    updateData(data, filters) {
        this.clearPlanets();
        if (!data || !data.friends) return;

        const { year, month, period, visualization } = filters;
        const myId = data.id;

        // 1. Priprema profila sa engleskim nazivima lokacija
        const friendsProfiles = data.friends.map(friend => {
            let totalMessages = 0;
            const messageObject = data.messages.find(m => m.friend_id === friend.id);
            if (messageObject) {
                totalMessages = messageObject.messages.filter(msg => 
                    this.isDateInFilter(msg.timestamp, year, month, period)
                ).length;
            }

            const friendRelatedPosts = data.posts.filter(post => {
                const isCorrectDate = this.isDateInFilter(post.timestamp, year, month, period);
                if (!isCorrectDate) return false;
                return post.author_id === friend.id || 
                    post.interactions?.likes?.includes(friend.id) || 
                    post.interactions?.comments?.some(c => c.user_id === friend.id);
            });

            const totalPosts = friendRelatedPosts.length;
            const postsToMe = friendRelatedPosts.filter(p => p.to === null || p.to === myId).length;
            const primaryValue = (visualization === 'Messages') ? totalMessages : postsToMe;

            return {
                friend,
                primaryValue,
                stats: {
                    id: friend.id,
                    username: friend.username || friend.name,
                    gender: friend.gender,
                    occupation: friend.occupation || 'N/A',
                    location: friend.location || { city: 'Unknown', country: 'Unknown' },
                    messagesCount: totalMessages,
                    postsToMe: postsToMe,
                    totalPosts: totalPosts
                }
            };
        });

        // 2. Dinamički opseg za distancu
        const values = friendsProfiles.map(p => p.primaryValue);
        const maxVal = Math.max(...values, 1);
        const minVal = Math.min(...values);
        const range = maxVal - minVal;

        // 3. Sortiranje po nazivu GRADA (English names)
        friendsProfiles.sort((a, b) => {
            const cityA = a.friend.location?.city || '';
            const cityB = b.friend.location?.city || '';
            return cityA.localeCompare(cityB);
        });

        // 4. Iscrtavanje sa Jitterom i adaptivnom distancom
        friendsProfiles.forEach((profile, index) => {
            const angle = (index / friendsProfiles.length) * Math.PI * 2;
            const normalized = range > 0 ? (profile.primaryValue - minVal) / range : 0;

            const minDistance = 12;
            const maxDistance = 38;
            let distance = maxDistance - (normalized * (maxDistance - minDistance));
            
            // Jittering za organski izgled asteroidnog pojasa
            const finalDistance = distance + (Math.random() - 0.5) * 3.0;

            const scale = Math.max(0.4, Math.min(2.0, 0.4 + (normalized * 1.6)));
            const color = this.getGenderColor(profile.friend.gender);

            this.addPlanetToSystem(angle, finalDistance, color, profile.primaryValue, scale, profile.stats);
        });
    }

    addPlanetToSystem(angle, distance, color, speedWeight, scale, stats) {
        const x = Math.cos(angle) * distance;
        const z = Math.sin(angle) * distance;

        const detail = Math.floor(Math.random() * 5) + 1;
        const planetGeometry = new THREE.TetrahedronGeometry(scale, detail);
        
        const planetMaterial = new THREE.MeshStandardMaterial({
            color: '#1a1a1a',
            emissive: color,
            emissiveIntensity: 1.2,
            roughness: 0.8,
            metalness: 0.2
        });

        const planet = new THREE.Mesh(planetGeometry, planetMaterial);
        
        // Zakači podatke za mesh
        planet.userData = {
            isPlanet: true,
            info: stats,
            isZoomed: false
        };

        planet.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
        planet.position.set(x, (Math.random() - 0.5) * 5, z);

        const lineMaterial = new THREE.LineBasicMaterial({ 
            color: '#ffcc00', 
            transparent: true, 
            opacity: 0.03 
        });
        const lineGeometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0, 0, 0),
            planet.position
        ]);
        const line = new THREE.Line(lineGeometry, lineMaterial);

        const planetGroup = new THREE.Group();
        planetGroup.add(planet);
        planetGroup.add(line);

        this.container.add(planetGroup);

        this.planets.push({
            group: planetGroup,
            rotationSpeed: {
                x: (Math.random() - 0.5) * 0.02,
                y: (Math.random() - 0.5) * 0.02
            },
            speed: 0.0004 + (speedWeight * 0.00004)
        });
    }

    isDateInFilter(timestamp, year, month, period) {
        const dateParts = timestamp.split('/');
        const m = parseInt(dateParts[0]);
        const y = parseInt(dateParts[2]);
        return period === 'Year' ? y === year : (y === year && m === month);
    }

    getGenderColor(gender) {
        switch(gender) {
            case 'Male': return '#00f2ff';
            case 'Female': return '#ff00cc';
            case 'Other': return '#b366ff';
            default: return '#7f7f7f';
        }
    }

    showTooltip(data) {
        if (!this.tooltipElement) return;
        this.tooltipElement.style.display = 'block';
        this.tooltipElement.innerHTML = `
            <div class="tooltip-header">
                <strong>${data.username}</strong>
                <div style="font-size: 10px; color: #888; margin-top:2px;">${data.occupation} | ${data.location.city},${data.location.country}</div>
            </div>
            <div class="tooltip-row">
                <span class="label">Gender:</span>
                <span class="value">${data.gender}</span>
            </div>
            <div class="tooltip-row" style="margin-top: 8px; border-top: 1px dashed #333; padding-top: 5px;">
                <span class="label">📩 Messages:</span>
                <span class="value">${data.messagesCount}</span>
            </div>
            <div class="tooltip-row">
                <span class="label">📝 Posts (to me/all):</span>
                <span class="value">${data.postsToMe}/${data.totalPosts}</span>
            </div>
        `;

        const x = (this.raycaster.mouse.x * 0.5 + 0.5) * window.innerWidth;
        const y = (-(this.raycaster.mouse.y * 0.5 - 0.5) * window.innerHeight);
        this.tooltipElement.style.left = `${x + 20}px`;
        this.tooltipElement.style.top = `${y + 20}px`;
    }

    hideTooltip() {
        if (this.tooltipElement) this.tooltipElement.style.display = 'none';
    }

    setTooltipElement(element) {
        this.tooltipElement = element;
    }

    clearPlanets() {
        // Čuvamo Sunce i svetlo (prva dva elementa u containeru)
        while(this.container.children.length > 2) {
            const child = this.container.children[2];
            this.container.remove(child);
            child.traverse(node => {
                if(node.geometry) node.geometry.dispose();
                if(node.material) node.material.dispose();
            });
        }
        this.planets = [];
    }

    update() {
        if(this.raycaster) this.raycaster.update();
        
        if(this.sun) {
            const time = Date.now() * 0.0005;
            const s = 1 + Math.sin(time * 2) * 0.03;
            this.sun.scale.set(s, s, s);
            this.sun.rotation.y += 0.001;
        }

        this.planets.forEach(p => {
            if(!this.isPaused) {
                // Kruženje oko Sunca
                p.group.rotation.y += p.speed;
                
                // Rotacija asteroida oko svoje ose
                const mesh = p.group.children[0];
                mesh.rotation.x += p.rotationSpeed.x;
                mesh.rotation.y += p.rotationSpeed.y;
            }
        });
    }
}