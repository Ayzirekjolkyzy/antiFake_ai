package kg.manas.backend.model.enums;

public enum ProductVolume {

    ML_5,
    ML_10,
    ML_15,
    ML_20,
    ML_25,
    ML_30,
    ML_35,
    ML_40,
    ML_45,
    ML_50,
    ML_55,
    ML_60,
    ML_65,
    ML_70,
    ML_75,
    ML_80,
    ML_85,
    ML_90,
    ML_95,
    ML_100,
    ML_120,
    ML_125,
    ML_150,
    ML_200,
    ML_250,
    ML_300,
    ML_350,
    ML_500,
    ML_1000;

    public String getDisplayName() {
        return this.name().replace("ML_", "") + " ml";
    }
}