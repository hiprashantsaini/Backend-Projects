const storeModel = require('../models/storeModel');
const userModel = require('../models/userModel');

const createStore = async (req, res) => {
    try {

        const userData = await userModel.findOne({ _id: req.body.vendor_id });

        if (userData) {
            if (!req.body.latitude || !req.body.longitude) {
                res.status(200).send({ success: false, msg: "latitude and longitude is required" });
            } else {
                // As only one vendor can created store with one vendor_id. So check is store alredy exists?
                const vendorData = await storeModel.findOne({ vendor_id: req.body.vendor_id });
                if (vendorData) {
                    res.status(200).send({ success: true, msg: "This Vendor already has a store" });
                } else {
                    //In this case create store
                    const store=storeModel({
                        vendor_id: req.body.vendor_id,
                        logo: req.file.filename,
                        business_email: req.body.business_email,
                        address: req.body.address,
                        pin: req.body.pin,
                        location: {
                            type: "Point",
                            coordinates: [parseFloat(req.body.longitude), parseFloat(req.body.latitude)]
                        }
                    });
                    const storeData= await store.save();
                    res.status(200).send({ success: true, msg: "Stored data",data:storeData });

                }
            }

        } else {
            res.status(200).send({ success: false, msg: "Vendor id does not exists" });
        }

    } catch (error) {
        console.log("createStore :", error.message);
        res.status(400).send(error.message);
    }
}

module.exports = {
    createStore
}