import * as THREE from 'three';
import Experience from "../Experience.js";
import Environment from './Environment.js';
import RadarSystem from './RadarSystem.js';

export default class World{
    constructor(){
        this.experience = new Experience();
        this.scene = this.experience.scene;
        this.resources = this.experience.resources;
        /*this.resources.on("ready", ()=>{
            this.envronment = new Environment();
            this.radarSystem = new RadarSystem();
        });*/
        this.envronment = new Environment();
        this.radarSystem = new RadarSystem();
    }

    update(){
        if(this.radarSystem) this.radarSystem.update();
    }
}