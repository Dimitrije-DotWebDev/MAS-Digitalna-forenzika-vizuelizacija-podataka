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
        
        this.aiCache = new Map();
        this.currentActivePeerId = null;

        this.setupRaycaster();
    }

    setupRaycaster() {
        this.raycaster = new Raycaster();

        this.raycaster.on('hoverIn', (planetMesh) => {
            this.isPaused = true;

            if (!planetMesh.userData.isZoomed) {
                planetMesh.scale.multiplyScalar(1.5); // Vraćeno na tvoj originalni multiplyScalar
                planetMesh.userData.isZoomed = true;
            }

            planetMesh.material.emissiveIntensity = 5.0; 
            
            const data = planetMesh.userData.info;
            this.currentActivePeerId = data.id;

            this.handleOnDemandAi(data);
            
            document.body.style.cursor = 'pointer';
        });

        // 🚨 SADA RADI SAVRŠENO: planetMesh više nije undefined, već stiže tačna planeta!
        this.raycaster.on('hoverOut', (planetMesh) => {
            this.resetSinglePlanet(planetMesh);
        });
    }

    resetSinglePlanet(planetMesh) {
        this.isPaused = false;
        this.currentActivePeerId = null;
        this.hideTooltip();
        document.body.style.cursor = 'default';

        // Pošto planetMesh sada stiže ispravno, skupljanje radi instant!
        if (planetMesh && planetMesh.userData.isZoomed) {
            planetMesh.scale.divideScalar(1.5); // Vraćeno na tvoj originalni divideScalar
            planetMesh.userData.isZoomed = false;
        }
        if(planetMesh) planetMesh.material.emissiveIntensity = 1.2;
    }

    setSun() {
        const sunGeometry = new THREE.SphereGeometry(4, 32, 32);
        const sunMaterial = new THREE.MeshBasicMaterial({ color: '#ffcc00' });
        this.sun = new THREE.Mesh(sunGeometry, sunMaterial);
        this.container.add(this.sun);

        const ambientLight = new THREE.AmbientLight('#ffffff', 0.8);
        this.container.add(ambientLight);
    }

    getGenderColor(gender) {
        if (gender === 'Male') return '#00ffcc';
        if (gender === 'Female') return '#ff007f';
        return '#ffffff';
    }

    isDateInFilter(timestamp, year, month, period) {
        if (!timestamp) return false;
        const parts = timestamp.split('/');
        if (parts.length < 3) return false;
        
        const m = parseInt(parts[0], 10);
        const y = parseInt(parts[2], 10);
        
        if (period === 'Year') {
            return y === year;
        } else {
            return y === year && m === month;
        }
    }

    updateData(data, filters) {
        this.clearPlanets();
        if (!data || !data.friends) return;

        const { year, month, period, visualization } = filters;
        const myId = data.id;

        this.aiCache.clear();

        const friendsProfiles = data.friends.map(friend => {
            let totalMessages = 0;
            let peerTextList = [];

            const messageObject = data.messages.find(m => m.friend_id === friend.id);
            if (messageObject && messageObject.messages) {
                messageObject.messages.forEach(m => {
                    peerTextList.push(`[${m.timestamp}] MESSAGE (Received: ${m.received}): ${m.content}`);
                });

                totalMessages = messageObject.messages.filter(msg => 
                    this.isDateInFilter(msg.timestamp, year, month, period)
                ).length;
            }

            const friendRelatedPosts = data.posts.filter(post => {
                if (post.author_id === friend.id && post.content) {
                    const target = post.to === null ? 'Public Feed' : post.to === myId ? 'Directly to Main User' : `User ${post.to}`;
                    const likesCount = post.interactions?.likes?.length || 0;
                    const commentsCount = post.interactions?.comments?.length || 0;
                    
                    peerTextList.push(`[${post.timestamp}] POST to ${target} (Likes: ${likesCount}, Comments: ${commentsCount}): ${post.content}`);
                }
                
                const isCorrectDate = this.isDateInFilter(post.timestamp, year, month, period);
                if (!isCorrectDate) return false;
                return post.author_id === friend.id || 
                    (post.interactions?.likes?.includes(friend.id)) || 
                    (post.interactions?.comments?.some(c => c.user_id === friend.id));
            });

            const totalPosts = friendRelatedPosts.length;
            const postsToMe = friendRelatedPosts.filter(p => p.to === null || p.to === myId).length;
            const primaryValue = (visualization === 'Messages') ? totalMessages : postsToMe;

            const combinedPeerText = peerTextList.join(' ');

            const statsObj = {
                id: friend.id,
                username: friend.username || friend.name,
                gender: friend.gender,
                occupation: friend.occupation || 'N/A',
                location: friend.location || { city: 'Unknown', country: 'Unknown' },
                messagesCount: totalMessages,
                postsToMe: postsToMe,
                totalPosts: totalPosts,
                combinedPeerText: combinedPeerText, 
                relationship: 'Analyzing...',
                anomaly: 'Llama scanning required...',
                aiLoaded: false
            };

            return {
                friend,
                primaryValue,
                stats: statsObj
            };
        });

        const values = friendsProfiles.map(p => p.primaryValue);
        const maxVal = Math.max(...values, 1);
        const minVal = Math.min(...values);
        const range = maxVal - minVal;

        friendsProfiles.sort((a, b) => {
            const cityA = a.friend.location?.city || '';
            const cityB = b.friend.location?.city || '';
            return cityA.localeCompare(cityB);
        });

        friendsProfiles.forEach((profile, index) => {
            const angle = (index / friendsProfiles.length) * Math.PI * 2;
            const normalized = range > 0 ? (profile.primaryValue - minVal) / range : 0;

            const minDistance = 12;
            const maxDistance = 38;
            let distance = maxDistance - (normalized * (maxDistance - minDistance));
            
            const finalDistance = distance + (Math.random() - 0.5) * 3.0;
            const scale = Math.max(0.4, Math.min(2.0, 0.4 + (normalized * 1.6)));
            const color = this.getGenderColor(profile.friend.gender);

            this.addPlanetToSystem(angle, finalDistance, color, profile.primaryValue, scale, profile.stats);
        });
    }

    async handleOnDemandAi(statsObject) {
        if (this.aiCache.has(statsObject.id)) {
            const cachedData = this.aiCache.get(statsObject.id);
            statsObject.relationship = cachedData.relationship;
            statsObject.anomaly = cachedData.anomaly;
            statsObject.aiLoaded = true;
            this.showTooltip(statsObject);
            return;
        }

        if (!statsObject.combinedPeerText || statsObject.combinedPeerText.trim().length < 5) {
            statsObject.relationship = 'Personal Friend';
            statsObject.anomaly = 'No direct communication trace discovered.';
            statsObject.aiLoaded = true;
            this.showTooltip(statsObject);
            return;
        }

        statsObject.aiLoaded = false;
        statsObject.relationship = 'Analyzing...';
        statsObject.anomaly = 'De-encrypting timeline history via local Llama...';
        this.showTooltip(statsObject);

        try {
            const response = await fetch('http://localhost:8000/analyze-peer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: statsObject.username,
                    peer_text: statsObject.combinedPeerText
                })
            });

            if (response.ok && this.currentActivePeerId === statsObject.id) {
                const aiData = await response.json();
                
                statsObject.relationship = aiData.relationship;
                statsObject.anomaly = aiData.anomaly;
                statsObject.aiLoaded = true;

                this.aiCache.set(statsObject.id, {
                    relationship: aiData.relationship,
                    anomaly: aiData.anomaly
                });

                this.showTooltip(statsObject);
            }
        } catch (error) {
            console.error(`❌ Connection failed for ${statsObject.username}:`, error);
            if (this.currentActivePeerId === statsObject.id) {
                statsObject.relationship = 'Offline';
                statsObject.anomaly = 'Could not connect to local Llama server.';
                statsObject.aiLoaded = true;
                this.showTooltip(statsObject);
            }
        }
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
            opacity: 0.2,
            Blending: THREE.AdditiveBlending
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

    showTooltip(data) {
        if (!this.tooltipElement) return;

        let relColor = '#ff9900'; 
        let relBg = 'rgba(255, 153, 0, 0.04)';
        let relBorder = 'rgba(255, 153, 0, 0.25)';
        let relText = data.relationship || 'Analyzing...';

        let loadingSpinnerHtml = '';
        if (!data.aiLoaded) {
            loadingSpinnerHtml = `<span style="display:inline-block; width:8px; height:8px; border:2px solid rgba(255,153,0,0.2); border-top-color:#ff9900; border-radius:50%; animation:spin 0.8s linear infinite; margin-right:5px;"></span>`;
        } else {
            const rel = relText.toLowerCase();
            if (rel.includes('suspect') || rel.includes('spy') || rel.includes('alert') || rel.includes('danger') || rel.includes('alliance')) {
                relColor = '#ff4a4a'; 
                relBg = 'rgba(255, 74, 74, 0.12)';
                relBorder = 'rgba(255, 74, 74, 0.4)';
            } else if (rel.includes('colleague') || rel.includes('work') || rel.includes('professional')) {
                relColor = '#53b1fd'; 
                relBg = 'rgba(83, 177, 253, 0.08)';
                relBorder = 'rgba(83, 177, 253, 0.3)';
            } else {
                relColor = '#00ffcc'; 
                relBg = 'rgba(0, 255, 204, 0.08)';
                relBorder = 'rgba(0, 255, 204, 0.3)';
            }
        }

        const hasCriticalAnomaly = data.aiLoaded && data.anomaly && !data.anomaly.includes('Consistent') && !data.anomaly.includes('None detected') && !data.anomaly.includes('stable');

        this.tooltipElement.style.display = 'block';
        this.tooltipElement.style.width = '25vw';
        this.tooltipElement.innerHTML = `
            <style>
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes pulseBlur { from { opacity: 0.4; } to { opacity: 0.8; } }
            </style>
            <div class="tooltip-header" style="margin-bottom: 8px; font-family: monospace; min-width: 290px;">
                <div style="display: flex; justify-content: space-between; align-items: center; gap: 12px; width: 100%;">
                    <strong style="font-size: 13px; color: #fff;">${data.username}</strong>
                    <span style="font-size: 9px; font-weight: 700; padding: 2px 6px; border-radius: 4px; color: ${relColor}; background: ${relBg}; border: 1px solid ${relBorder}; letter-spacing: 0.5px; white-space: nowrap; display: flex; align-items: center;">
                        ${loadingSpinnerHtml}${relText.toUpperCase()}
                    </span>
                </div>
                <div style="font-size: 10px; color: #8a9ba8; margin-top: 4px;">
                    ${data.occupation} | ${data.location.city}, ${data.location.country}
                </div>
            </div>
            
            <div class="tooltip-row" style="display: flex; justify-content: space-between; margin: 4px 0; font-size: 11px; font-family: monospace;">
                <span style="color: #627d98;">Gender:</span>
                <span style="color: #fff; font-weight: 600;">${data.gender}</span>
            </div>
            
            <div class="tooltip-row" style="display: flex; justify-content: space-between; margin: 4px 0; margin-top: 6px; border-top: 1px dashed rgba(255,255,255,0.1); padding-top: 6px; font-size: 11px; font-family: monospace;">
                <span style="color: #627d98;">📩 Interval Messages:</span>
                <span style="color: #fff; font-weight: 600;">${data.messagesCount}</span>
            </div>
            
            <div class="tooltip-row" style="display: flex; justify-content: space-between; margin: 4px 0; font-size: 11px; font-family: monospace;">
                <span style="color: #627d98;">📝 Posts (to me/all):</span>
                <span style="color: #fff; font-weight: 600;">${data.postsToMe} / ${data.totalPosts}</span>
            </div>

            <div style="margin-top: 8px; padding: 6px; border-radius: 4px; font-family: monospace; font-size: 10px; line-height: 1.3;
                        background: ${hasCriticalAnomaly ? 'rgba(255, 74, 74, 0.08)' : 'rgba(255, 255, 255, 0.02)'};
                        border-left: 2px solid ${hasCriticalAnomaly ? '#ff4a4a' : '#627d98'};
                        color: ${hasCriticalAnomaly ? '#ffcbd1' : '#a0aec0'};
                        ${!data.aiLoaded ? 'animation: pulseBlur 1s infinite alternate;' : ''}">
                <span style="font-weight: bold; display: block; margin-bottom: 2px; color: ${hasCriticalAnomaly ? '#ff4a4a' : '#627d98'};">
                    ${hasCriticalAnomaly ? '⚠️ METRIC ANOMALY DETECTED:' : data.aiLoaded ? '✓ HISTORICAL PROFILE:' : '⚙ EXTRACTING PROFILE MATRIX...'}
                </span>
                ${data.anomaly}
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
                p.group.rotation.y += p.speed;
            }
            p.group.children[0].rotation.x += p.rotationSpeed.x;
            p.group.children[0].rotation.y += p.rotationSpeed.y;
        });
    }
}