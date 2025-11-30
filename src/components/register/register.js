import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./register.css";
import { useTranslation } from "react-i18next";
import ImageSelectUpload from '../new_product/image_select_upload.js';


function Register() {
  const apiUrl = process.env.REACT_APP_API_URL;
  const cloudName = process.env.REACT_APP_CLOUD_NAME;
  const uploadPreset = process.env.REACT_APP_UPLOAD_PRESET;
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const [role, setRole] = useState("shoper");
  const [selectedCity, setSelectedCity] = useState(null);
  const [selectedSubCity, setSelectedSubCity] = useState(null);
  const [subCities, setSubCities] = useState([]);
  const [selectedCityIndex, setSelectedCityIndex] = useState(null);
  const [selectedSubCityIndex, setSelectedSubCityIndex] = useState(null);


  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
    shopName: "",
    address: "",
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const cities = [
    "Ariana", "Ben Arous", "Bizerte", "Béja", "Gabès", "Gafsa", "Jendouba",
    "Kairouan", "Kasserine", "Kébili", "La Manouba", "Le Kef",
    "Mahdia", "Monastir", "Médenine", "Nabeul", "Sfax", "Sidi Bouzid",
    "Siliana", "Sousse", "Tataouine", "Tozeur", "Tunis", "Zaghouan"
  ];

  const citiesData = {
    "Ariana": [
      "Sidi Thabet", "Riadh Andalous", "Raoued", "Nouvelle Ariana", "Mnihla",
      "Les Jardins El Menzah 2", "Les Jardins El Menzah 1", "La Soukra",
      "Kalâat Andalous", "Jardins El Menzah", "Ghazela", "Ettadhamen",
      "Ennasr", "El Menzah 8", "El Menzah 7", "El Menzah 6", "El Menzah 5",
      "Dar Fadhal", "Cité Hedi Nouira", "Cité Ennasr 2", "Cité Ennasr 1",
      "Cite Ennkhilet", "Chotrana 3", "Chotrana 2", "Chotrana 1", "Chotrana",
      "Charguia 2", "Charguia 1", "Borj Louzir", "Autres Villes",
      "Ariana Ville", "Ariana Essoughra", "Ariana"
    ],
    "Ben Arous": [
      "Sidi Rezig", "Radès", "Mégrine", "Mornag", "Mohamedia",
      "Medina Jedida", "Hammam Lif", "Hammam Chott", "Fouchana",
      "Ezzahra", "El Mourouj 6", "El Mourouj 5", "El Mourouj 4",
      "El Mourouj 3", "El Mourouj 1", "El Mourouj", "Boumhel",
      "Borj Cedria", "Ben Arous", "Autres Villes"
    ],
    "Bizerte": [
      "Zarzouna", "Utique", "Tinja", "Sejenane", "Ras Jebel",
      "Menzel Jemil", "Menzel Bourguiba", "Mateur", "Ghezala",
      "Ghar El Melh", "El Alia", "Djoumime", "Bizerte Sud",
      "Bizerte Nord", "Bizerte", "Autres Villes"
    ],
    "Béja": [
      "Téboursouk", "Thibar", "Testour", "Nefza", "Medjez El Bab",
      "Goubellat", "El Ksar", "Béja Sud", "Béja Nord", "Béja",
      "Amdoun", "Autres Villes"
    ],
    "Gabès": [
      "Nouvelle Matmata", "Métouia", "Matmata", "Mareth", "Ghanouch",
      "Gabès Sud", "Gabès Ouest", "Gabès Médina", "Gabès", "El Hamma",
      "Autres Villes"
    ],
    "Gafsa": [
      "Sidi Aïch", "Sened", "Redeyef", "Oum El Araies", "Métlaoui",
      "Mdhila", "Gafsa Sud", "Gafsa Nord", "Gafsa", "El Ksar",
      "El Guettar", "Belkhir", "Autres Villes"
    ],
    "Jendouba": [
      "Tabarka", "Oued Meliz", "Jendouba Nord", "Jendouba",
      "Ghardimaou", "Fernana", "Bou Salem", "Balta Bou Aouane",
      "Ain Draham", "Autres Villes"
    ],
    "Kairouan": [
      "Sbikha", "Nasrallah", "Kairouan Sud", "Kairouan Nord", "Kairouan",
      "Hajeb El Ayoun", "Haffouz", "El Ouslatia", "El Alâa", "Echrarda",
      "Chebika", "Bouhajla", "Autres Villes"
    ],
    "Kasserine": [
      "Thala", "Sbiba", "Sbeïtla", "Majel Bel Abbès", "Kasserine Sud",
      "Kasserine Nord", "Kasserine", "Hidra", "Hassi Ferid", "Fériana",
      "Foussana", "Ezzouhour", "El Ayoun", "Djedeliane", "Autres Villes"
    ],
    "Kébili": [
      "Souk Lahad", "Kébili Sud", "Kébili Nord", "Kébili", "Faouar",
      "Douz Sud", "Douz Nord", "Autres Villes"
    ],
    "La Manouba": [
      "Tebourba", "Oued Ellil", "Mornaguia", "Menzel El Habib", "Manouba Ville",
      "La Manouba", "El Battan", "Douar Hicher", "Djedeida", "Denden",
      "Borj El Amri", "Autres Villes"
    ],
    "Le Kef": [
      "Tajerouine", "Sakiet Sidi Youssef", "Nebeur", "Le Kef", "Kef Ouest",
      "Kef Est", "Kalâat Snan", "Kalâat Khasbah", "Es Sers", "El Ksour",
      "Djerissa", "Dahmani", "Autres Villes"
    ],
    "Mahdia": [
      "Sidi Alouane", "Ouled Chamekh", "Melloulèche", "Mahdia", "Ksour Essef",
      "Hebira", "Essouassi", "El Jem", "Chorbane", "Chebba", "Bou Merdès",
      "Autres Villes"
    ],
    "Monastir": [
      "Zéramdine", "Téboulba", "Sayada Lamta Bou Hajar", "Sahline", "Ouerdanine",
      "Monastir", "Monastir", "Moknine", "Ksibet El Médiouni", "Ksar Hellal",
      "Jemmal", "Beni Hassen", "Bembla", "Bekalta", "Autres Villes"
    ],
    "Médenine": [
      "Zarzis", "Wled Amor", "Touta", "Tezdaine", "Temlel", "Tawrit",
      "Sidi Makhloulf", "M’guersa", "Médenine Sud", "Médenine Nord", "Médenine",
      "Mezzraya", "Melita", "Mai", "Mahboubine", "Khazroun", "Hedade", "Gizen",
      "Fatou", "Djerba Midoun", "Djerba Houmt Souk", "Djerba Ajim", "Chebabia",
      "Boughrara", "Beni Khedech", "Ben Gardane", "Arkou", "Aghir", "Autres Villes"
    ],
    "Nabeul": [
      "Yasmine Hammamet", "Takelsa", "Soliman", "Nabeul", "Mrezga",
      "Menzel Temime", "Menzel Bouzelfa", "Kélibia", "Korba", "Hammamet Nord",
      "Hammamet Centre", "Hammamet", "Hammam Ghezèze", "Grombalia", "El Mida",
      "El Haouaria", "Dar Châabane El Fehri", "Béni Khiar", "Béni Khalled",
      "Bou Argoub", "Autres Villes"
    ],
    "Sfax": [
      "Thyna", "Skhira", "Sfax Ville", "Sfax Médina", "Sfax",
      "Sakiet Ezzit", "Sakiet Eddaïer", "Route Tunis", "Route TANIOUR",
      "Route Soukra", "Route SOKRA", "ROUTE SALTANIA", "Route MHARZA",
      "Route Menzel Chaker", "Route Mehdia", "Route MANZEL CHAKER", "Route GREMDA",
      "Route El Ain", "Route El Afrane", "Route de l'aéroport", "Route de GABES",
      "Menzel Chaker", "Mahrès", "Kerkennah", "Jebiniana", "Ghraiba",
      "El Hencha", "El Amra", "Bir Ali Ben Khalifa", "Agareb", "Autres Villes"
    ],
    "Sidi Bouzid": [
      "Souk Jedid", "Sidi Bouzid Ouest", "Sidi Bouzid Est", "Sidi Bouzid",
      "Sidi Ali Ben Aoun", "Regueb", "Ouled Haffouz", "Mezzouna",
      "Menzel Bouzaiane", "Meknassy", "Jilma", "Cebbala Ouled Asker",
      "Bir El Hafey", "Autres Villes"
    ],
    "Siliana": [
      "Siliana Sud", "Siliana Nord", "Siliana", "Sidi Bou Rouis",
      "Rouhia", "Makthar", "Kesra", "Gaâfour", "El Krib",
      "El Aroussa", "Bou Arada", "Bargou", "Autres Villes"
    ],
    "Sousse": [
      "Zaouit Ksibat Thrayett", "Sousse Sidi Abdelhamid", "Sousse Riadh",
      "Sousse Médina", "Sousse Jawhara", "Sousse corniche", "Sousse",
      "Sidi El Héni", "Sidi Bou Ali", "Sahloul", "M Saken", "Kondar",
      "Khzema", "Kantaoui", "Kalaâ Sghira", "Kalaâ Kebira", "Hergla",
      "Hammam Sousse", "Enfidha", "Chatt mariem", "Bouficha", "Akouda",
      "Autres Villes"
    ],
    "Tataouine": [
      "Tataouine Sud", "Tataouine Nord", "Tataouine", "Smâr", "Remada",
      "Ghomrassen", "Dehiba", "Bir Lahmar", "Autres Villes"
    ],
    "Tozeur": [
      "Tozeur", "Tameghza", "Nefta", "Hazoua",
      "Degache", "Autres Villes"
    ],
    "Tunis": [
      "Tunis Belvedere", "Tunis", "Séjoumi", "Sidi Hassine", "Sidi El Béchir",
      "Sidi Daoud", "Sidi Bou Said", "Médina", "Mutuelleville", "Montplaisir",
      "Monfleury", "Menzah", "Manar", "Le Kram", "Le Bardo", "Lac 2", "Lac 1",
      "La Marsa", "La Goulette", "L Aouina", "Ksar Said", "Kheireddine Pacha",
      "Khaznadar", "Jardins De Carthage", "Hraïria", "Gammarth", "Ezzouhour",
      "Ettahrir", "El Ouardia", "El Omrane Supérieur", "El Omrane", "El Menzah 9",
      "El Menzah 4", "El Menzah 1", "El Manar 2", "El Manar 1", "El Kabaria",
      "Djebel Jelloud", "Cité Olympique", "Cité jardin", "Cité El Khadra",
      "Centre Ville Lafayette", "Centre Urbain Nord", "Carthage", "Bellevue",
      "Bab Souika", "Alain Savary", "Ain Zaghouen",
      "Ain Zaghouan Sud", "Ain Zaghouan Nord", "Agba", "Autres Villes"
    ],
    "Zaghouan": [
      "Zaghouen", "Saouaf", "Ez Zeriba", "En Nadhour",
      "El Fahs", "Bir Mchergua", "Autres Villes"
    ]
  };


  const handleCityChange = (e) => {
    const cityIndex = e.target.selectedIndex - 1;
    setSelectedCityIndex(cityIndex);
    const selectedCityName = cities[cityIndex];
    setSelectedCity(selectedCityName);
    setSubCities(citiesData[cities[cityIndex]] || []);
    setSelectedSubCityIndex(null);
  };

  const handleSubCityChange = (e) => {
    const subCityIndex = e.target.selectedIndex - 1;
    const selectedSubCityName = subCities[subCityIndex];
    setSelectedSubCity(selectedSubCityName);
    setSelectedSubCityIndex(subCityIndex);
  };

  const handleRoleChange = (e) => {
    setRole(e.target.value);
    setImageFile(null);
    setImagePreview(null);
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      phone: "",
      shopName: "",
      address: "",
    });
    setError("");
  };

  const handleImageChange = (files) => {
    const file = files && files.length > 0 ? files[0] : null;
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setImageFile(null);
      setImagePreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (role === "seller") {
      if (!formData.shopName || !formData.address) {
        setError(t("register.error.fillShopNameAddress"));
        return;
      }
      if (!imageFile) {
        setError(t("register.error.uploadProfileImage"));
        return;
      }
    }
    if (role === "shoper") {
      if (!formData.phone) {
        setError(t("register.error.enterPhone"));
        return;
      }
    }

    try {
      let imageUrl = "";

      if (imageFile) {
        const formData = new FormData();
        formData.append("file", imageFile);
        formData.append("upload_preset", uploadPreset);

        const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
          method: "POST",
          body: formData,
        });

        if (!res.ok) throw new Error("Image upload failed");

        const data = await res.json();
        imageUrl = data.secure_url;
      }

      let endpoint = "";
      let payload = {};

      if (role === "seller") {
        endpoint = `${apiUrl}/sellers/create`;
        payload = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          shopName: formData.shopName,
          address: formData.address ? [{
            address: formData.address,
            city: selectedCityIndex,
            subCity: selectedSubCityIndex,
            dateModified: new Date()
          }
          ] : [],
          phone: formData.phone ? [{ phone: formData.phone, dateModified: new Date() }] : [],
          image: imageUrl,
          active: false,
          lastOnline: new Date(),
        };
      } else {
        endpoint = `${apiUrl}/users/create`;
        payload = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          address: formData.address ? [{
            address: formData.address,
            city: selectedCityIndex,
            subCity: selectedSubCityIndex,
            dateModified: new Date()
          }
          ] : [],
          phone: formData.phone ? [{ phone: formData.phone, dateModified: new Date() }] : [],
          image: imageUrl || "",
          active: true,
          lastOnline: new Date(),
        };
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(t("register.error.registrationFailed"));

      navigate("/login");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="register-page">

      <div className="register-page-content">
        <div className="register-container" dir={i18n.language === "ar" ? "rtl" : "ltr"}>
          <form className="register-form" onSubmit={handleSubmit}>
            <h2>{t("register.title")}</h2>
            {error && <p className="error">{error}</p>}

            <label>{t("register.role")}</label>
            <select value={role} onChange={handleRoleChange}>
              <option value="shoper">{t("register.shoper")}</option>
              <option value="seller">{t("register.seller")}</option>
            </select>

            <label>{t("register.firstName")}</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
            />
            <label>{t("register.lastName")}</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
            />
            <label>{t("register.email")}</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <label>{t("register.password")}</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <label>{t("register.phone")}</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
            />
            <label>{t("register.address")}</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
            />
            <label>{t("register.city")}</label>
            <select name="city" value={selectedCity || ''} onChange={handleCityChange} required>
              <option value="">-- {t("selectCity")} --</option>
              {cities.map((city, index) => (
                <option key={index} value={city}>
                  {city}
                </option>
              ))}
            </select>

            {selectedCity && (
              <>
                <label>{t("register.subCity")}</label>
                <select name="subCity" value={selectedSubCity || ''} onChange={handleSubCityChange} required>
                  <option value="">-- {t("selectSubCity")} --</option>
                  {subCities.map((subCity, index) => (
                    <option key={index} value={subCity}>
                      {subCity}
                    </option>
                  ))}
                </select>
              </>
            )}

            {role === "shoper" && (
              <>
                <label>{t("register.profileImageOptional")}</label>
                <ImageSelectUpload onImageChange={handleImageChange} maximages={1} />
              </>
            )}

            {role === "seller" && (
              <>
                <label>{t("register.shopName")}</label>
                <input
                  type="text"
                  name="shopName"
                  value={formData.shopName}
                  onChange={handleChange}
                  required
                />


                <label>{t("register.profileImageRequired")}</label>
                <ImageSelectUpload onImageChange={handleImageChange} maximages={1} />
              </>
            )}

            <button type="submit">{t("register.submit")}</button>

            <p className="login-link">
              {t("register.alreadyRegistered")}
              <span
                onClick={() => navigate("/login")}
                style={{ color: "#0077cc", cursor: "pointer", textDecoration: "underline" }}
              >
                {t("login")}
              </span>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Register;
