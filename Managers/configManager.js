module.exports = () => {
    switch(process.env.NODE_ENV){
        case 'development':
            return require('../Configs/developmentConfig.json')
        case 'production':
            return require('../Configs/productionConfig.json')
        default:
            return require('../Configs/productionConfig.json')
    }
};