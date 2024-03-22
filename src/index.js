
const axios = require('axios')
const cheerio = require('cheerio')
const dotenv = require('dotenv')
dotenv.config()
const TOKEN = process.env.DISCORD_TOKEN
const CLIENT_ID = process.env.CLIENT_ID

const { REST, Routes, Client, GatewayIntentBits } = require('discord.js')
const client = new Client({ intents: [GatewayIntentBits.Guilds] })
const rest = new REST({ version: '10' }).setToken(TOKEN)


const today = new Date()
const links = {
    news: 'https://www.theenemy.com.br/news',
    reviews: 'https://www.theenemy.com.br/reviews',
    esports: 'https://www.theenemy.com.br/esports'
}


const commands = [
    {
        name: 'news',
        description: 'Mostra notícias diárias do mundo dos games!',
    },
    {
        name: 'reviews',
        description: 'Mostra reviews mais recentes dos novos lançamentos'
    },
    {
        name: 'esports',
        description: 'Mostra as notícias diárias sobre e-sports'
    }
]

try {
    console.log('Started refreshing application (/) commands.')

    rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands })

    console.log('Successfully reloaded application (/) commands.')
} catch (error) {
    console.error(error)
}

async function scrapeNews(tag) {
    try {
        const response = await axios.get(tag)
        const $ = cheerio.load(response.data)

        const newsItems = $('.news-list__wrapper')
        const newsList = []

        newsItems.each((_, element) => {
            const $element = $(element)
            const title = $element.find('.news-list__item__content__title').text().trim()
            const description = $element.find('.news-list__item__content__description').text().trim()
            const link = 'https://www.theenemy.com.br' + $element.find('.news-list__item__content__title').attr('href')
            const imageUrl = $element.find('.news-list__item__content__info img').attr('src')
            const date = $element.find('.news-list__item__content__info__time span').text().trim()
            const readingTime = $element.find('.reading-time__text').text().trim()

            const newsItem = {
                title,
                description,
                link,
                imageUrl,
                date,
                readingTime
            }

            if (date.substring(0, 2) == today.getDate()) {
                newsList.push(newsItem)
            }

        })

        return newsList

    } catch (error) {
        console.error('Ocorreu um erro:', error)
    }
}

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`)
})

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return

    if (interaction.commandName === 'news') {
        try {
            const newsList = await scrapeNews(links.news)
            let response = ''

            newsList.forEach(news => {
                if (news.date.substring(0, 2) == today.getDate()) {
                    response += `
                    \n**📰 Notícia** \n\nTítulo: **${news.title}**\nData: ${news.date}\nLink: ${news.link}\nTempo de Leitura: ${news.readingTime}\n`
                }
            })
            await interaction.reply(response)
        } catch (error) {
            console.error('Erro ao obter notícias:', error)
            await interaction.reply('Ocorreu um erro ao obter as notícias.')
        }
    }

    if (interaction.commandName === 'reviews') {
        try {
            const newsList = await scrapeNews(links.reviews)
            let response = ''

            newsList.forEach(news => {
                if (news.date.substring(0, 2) == today.getDate()) {
                    response += `
                    \n**⭐ Review** \n\nTítulo: **${news.title}**\nData: ${news.date}\nLink: ${news.link}\nTempo de Leitura: ${news.readingTime}\n`
                }
            })
            await interaction.reply(response)
        } catch (error) {
            console.error('Erro ao obter notícias:', error)
            await interaction.reply('Ocorreu um erro ao obter as notícias.')
        }
    }

    if (interaction.commandName === 'esports') {
        try {
            const newsList = await scrapeNews(links.esports)
            let response = ''

            newsList.forEach(news => {
                if (news.date.substring(0, 2) == today.getDate()) {
                    response += `
                    \n**🎮 E-Sports** \n\nTítulo: **${news.title}**\nData: ${news.date}\nLink: ${news.link}\nTempo de Leitura: ${news.readingTime}\n`
                }
            })
            await interaction.reply(response)
        } catch (error) {
            console.error('Erro ao obter notícias:', error)
            await interaction.reply('Ocorreu um erro ao obter as notícias.')
        }
    }
})


client.login(TOKEN)