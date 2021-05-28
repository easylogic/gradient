import { LinearGradient } from '../../../editor/image-resource/LinearGradient';
import HueColor from '../../../util/HueColor';
import BaseSlider from '../../BaseSlider';

export default class HueScale extends BaseSlider {

    initialize () {
        super.initialize()
        this.minValue = 0
        this.maxValue = 360
    }

    template () {
        return `
            <div class="hue-scale">
                <div ref="$container" class="hue-scale-container">
                    <div ref="$bar" class="drag-bar"></div>
                </div>
            </div>
        `
    }

    getDefaultValue () {
        return this.$store.hsv.h
    }


    /** get calculated dist for domain value   */
    getCalculatedDist (e) {
        var current = e ? this.getMousePosition(e) : this.getCurrent(this.getDefaultValue() / this.maxValue);
        var dist = this.getDist(current);
        
        return dist; 
    }    

    refreshColorUI(e) {

        var dist = this.getCalculatedDist(e);
     
        this.setColorUI(dist/100);

        this.changeColor({
            h: (this.minValue + this.fullDist * (dist/100)) * 360,
            type: 'hsv'
        })
    }     

    setColorUI(v) {
        let p;

        if (v) {
            p =  this.minValue + v * this.fullDist; 
        } else {

            p = (this.getDefaultValue() / 360);

            const list = HueColor.getHueScale(p, 0.05);

            this.list = list;

            const minValue = list[0].start; 
            const maxValue = list[list.length-1].start;
    
            this.minValue = minValue;
            this.maxValue = maxValue;

            const fullDist = this.maxValue - this.minValue;
            this.fullDist = fullDist;  
            

            const colorsteps = list.map(it => {
                return {
                    color: it.rgb,
                    percent: (it.start - minValue)/fullDist*100,
                    unit: '%'
                }
            })
    
            // console.log(colorsteps);
    
            this.refs.$container.css('background-image', LinearGradient.toLinearGradient(colorsteps))            
        }

        if (p <= this.minValue) {
            this.refs.$bar.addClass('first').removeClass('last')
        } else if (p >= this.maxValue) {
            this.refs.$bar.addClass('last').removeClass('first')
        } else {
            this.refs.$bar.removeClass('last').removeClass('first')
        }

        this.setMousePosition(this.getMaxDist() * ( (p-this.minValue) / this.fullDist));        
    }
}
