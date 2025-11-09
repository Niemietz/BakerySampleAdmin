const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs-extra');
const merge = require('@fastify/deepmerge')({ all: true })
const path = require('path');

const app = express();
const MAIN_SITE_PORT = 3000;
const PORT = 3001;

const dataPath = path.join(__dirname, 'data', 'siteData.json');

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Load JSON data
const loadData = async () => {
    const data = await fs.readJson(dataPath);
    return data;
};

// Save JSON data
const saveData = async (data) => {
    await fs.writeJson(dataPath, data, { spaces: 2 });
};

// Admin edit form
app.get('/', async (req, res) => {
    const data = await loadData();
    res.render('edit', { data });
});

// Bakery Website
app.get('/site', async (req, res) => {
    res.redirect(`http://localhost:${MAIN_SITE_PORT}`)
});

// Expose JSON data
app.get('/data', async (req, res) => {
    res.json(await fs.readJson(dataPath));
});

// Handle form submission
app.post('/', async (req, res) => {
    const {
        heroTitle,
        heroSubtitle,
        heroCTA,
        whyChooseUsTitle,
        whyChooseUsDescription,
        visitUs,
        visitUsDescription,
        visitUsCTA,
        address,
        phone
    } = req.body;

    let updatedData = merge(
        await loadData(),
        {
            hero: {
                title: heroTitle,
                subtitle: heroSubtitle,
                ctaText: heroCTA,
            },
            sections: {
                whyChooseUs: {
                    title: whyChooseUsTitle,
                    description: whyChooseUsDescription,
                },
            },
            footer: {
                visitUs: visitUs,
                visitUsDescription: visitUsDescription,
                visitUsCta_text: visitUsCTA,
                address: address,
                phone: phone,
            }
        }
    )

    try {
        await saveData(updatedData);
        res.redirect('/?success=true');
    } catch (err) {
        console.error(err);
        res.redirect('/?error=true');
    }
});

app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
