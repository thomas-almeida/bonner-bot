
const axios = require('axios')
const cheerio = require('cheerio')
const dotenv = require('dotenv')
dotenv.config()
const TOKEN = process.env.DISCORD_TOKEN
const CLIENT_ID = process.env.CLIENT_ID

const { REST, Routes, Client, GatewayIntentBits } = require('discord.js')
const client = new Client({ intents: [GatewayIntentBits.Guilds] })
const rest = new REST({ version: '10' }).setToken(TOKEN)

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
            //const imageUrl = $element.find('.news-list__item__content__info img').attr('src')
            const date = $element.find('.news-list__item__content__info__time span').text().trim()
            const readingTime = $element.find('.reading-time__text').text().trim()

            const newsItem = {
                title,
                description,
                link,
                //imageUrl,
                date,
                readingTime
            }

            newsList.push(newsItem)

        })

        return newsList

    } catch (error) {
        console.error('Ocorreu um erro:', error)
    }
}


client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`)
})


function formatNews(news) {
    return `\n**[${news.title}](${news.link})**\n${news.description}\n${news.date}\nTempo de Leitura: ${news.readingTime}\n`
}

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return

    if (interaction.commandName === 'news') {
        try {
            const newsList = await scrapeNews(links.news)
            let response = ''
            const maxNewsToShow = 5

            if (newsList.length === 0) {
                response = 'Nenhuma notícia encontrada.'
            } else {
                
                if (newsList.length > maxNewsToShow) {
                    response += '**📰 Últimas Notícias**\n'
                    for (let i = 0; i < maxNewsToShow; i++) {
                        response += formatNews(newsList[i])
                    }
                } else {
                    newsList.forEach(news => {
                        response += formatNews(news)
                    })
                }
            }

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
            const maxNewsToShow = 5 

            if (newsList.length === 0) {
                response = 'Nenhuma notícia encontrada.'
            } else {
                
                if (newsList.length > maxNewsToShow) {
                    response += '**⭐ Últimos Reviews**\n'
                    for (let i = 0; i < maxNewsToShow; i++) {
                        response += formatNews(newsList[i])
                    }
                } else {
                    newsList.forEach(news => {
                        response += formatNews(news)
                    })
                }
            }

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
            const maxNewsToShow = 5 

            if (newsList.length === 0) {
                response = 'Nenhuma notícia encontrada.'
            } else {
                
                if (newsList.length > maxNewsToShow) {
                    response += '**🎮 Últimas Notícias dos e-sports**\n'
                    for (let i = 0; i < maxNewsToShow; i++) {
                        response += formatNews(newsList[i])
                    }
                } else {
                    newsList.forEach(news => {
                        response += formatNews(news)
                    })
                }
            }

            await interaction.reply(response)
        } catch (error) {
            console.error('Erro ao obter notícias:', error)
            await interaction.reply('Ocorreu um erro ao obter as notícias.')
        }
    }

})


client.login(TOKEN)