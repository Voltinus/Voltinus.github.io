class SUD {
    
    input  = null;
    output = null;

    constructor(config) {
        if(config.inputId === undefined) throw "inputId undefined";
        if(config.outputId === undefined) throw "outputId undefined";

        this.input = {
            element = document.getElementById(config.inputId)
        }

        this.output = {
            element = document.getElementById(config.outputId)
        }
    }
}