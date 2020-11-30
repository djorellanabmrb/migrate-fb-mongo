const {FirebaseConfig } = require("configs-twtg");
const admin = require("firebase-admin");
const  TwtgOdm  = require("odm-twtg");
const twtOdm = new TwtgOdm();
twtOdm.connect();

admin.initializeApp({
    credential: admin.credential.cert(FirebaseConfig.credential),
    databaseURL: FirebaseConfig.databaseURL
});

const getDeliveries = async(state) =>{
    let now = new Date();
    
    admin.firestore()
    .collection('deliveries').where(`stateTime.${state}`, '<=', now).get()
    .then(snapshot =>{
        let i = 0;
        snapshot.forEach(async doc =>{
            i++;
            let deliveryDoc = await admin.firestore().collection('deliveries').doc(doc.id).get();
            let deliveryData = await deliveryDoc.data();
            for (var key in deliveryData.stateTime) {
                let date = new Date(deliveryData.stateTime[key].seconds * 1000);
                deliveryData.stateTime[key] = date;
            }
            let deliveryModel = {
                address: deliveryData.address,
                userType: deliveryData.alert,
                alias:{
                    id: deliveryData.alias.id,
                    name: deliveryData.alias.name
                },
                branch:{
                    id: deliveryData.branch?.id ?? 'SIN IDENTIFICADOR',
                    name: deliveryData.branch?.name ?? 'SIN SUCURSAL' ,
                    address: deliveryData.branch?.address ?? 'SIN DIRECCIÓN',
                    point: {
                        type: 'Point',
                        coordinates:[deliveryData.branch?.lat ?? 0, deliveryData.branch?.lng ?? 0]
                    }
                },
                circle:{
                    id: deliveryData.circle?.id ?? 0,
                    distance: deliveryData.circle?.distance ?? 0,
                    time: deliveryData.circle?.time ?? undefined
                },
                company: {
                    id: deliveryData.company?.id ?? 'SIN COMPAÑÍA',
                    name: deliveryData.company?.name ?? 'SIN NOMBRE'
                },
                distanceTraveled: deliveryData.distanceTraveled,
                locationEnd:{
                    type: 'Point',
                    coordinates:[deliveryData.locationEnd?._latitude ?? 0, deliveryData.locationEnd?._longitude ?? 0]
                },
                locationRef:{
                    type: 'Point',
                    coordinates:[deliveryData.locationRef?._latitude ?? 0, deliveryData.locationRef?._longitude ?? 0]
                },
                name: deliveryData.name,
                nota: deliveryData.nota,
                orderId: deliveryData.orderId,
                orderPic: deliveryData.orderPic,
                phone: deliveryData.phone,
                provider: deliveryData.provider,
                receivedPic: deliveryData.receivedPic,
                status: state,
                time: deliveryData.time,
                rating: {
                    calification: deliveryData.DeliveryCali?.Calification ?? undefined,
                    opinion:  deliveryData.DeliveryCali?.Opinion  ?? undefined
                },
                depto: {
                    name: deliveryData.depto ?? undefined,
                    id: undefined
                },
                muni: {
                    name: deliveryData.muni ?? undefined,
                    id: undefined
                },
                zone: {
                    name: deliveryData.zone ?? undefined,
                    id: undefined
                },
                alert: deliveryData.alert,
                orderObservations: deliveryData.orderObservations,
                statusTimes: deliveryData.stateTime
            }
            try {
                const _deliveryModel = new twtOdm.db.DeliveryModel(deliveryModel);
                await _deliveryModel.save();     
            } catch (error) {
                console.log(error);
            } 
        })
        console.log("terminado");
    })
}

getDeliveries("Entregado");