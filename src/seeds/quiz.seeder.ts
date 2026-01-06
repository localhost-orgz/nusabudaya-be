import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { Province } from 'src/provinces/entities/province.entity';
import { Quiz } from 'src/quizzes/entities/quiz.entity';

import provincesData from './data/province.data'; 
import traditionalHousesData from './data/traditional-houses.data';
import traditionalDancesData from './data/traditional-dances.data';
import traditionalWeaponsData from './data/traditional-weapons.data';
import culinariesData from './data/culinary.data';
import tourismSpotsData from './data/traditional-spots.data';
import regionalSongsData from './data/regional-song.data';

export default class QuizSeeder implements Seeder {
    public async run(
        dataSource: DataSource,
        factoryManager: SeederFactoryManager
    ): Promise<any> {
        const provinceRepository = dataSource.getRepository(Province);
        const quizRepository = dataSource.getRepository(Quiz);

        // acak pilihan jawaban (Fisher-Yates Shuffle)
        const shuffleArray = (array: string[]) => {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
            return array;
        };

        // mendapatkan 3 pengecoh (distractor) acak dari data provinsi lain
        const getDistractors = (correctAnswer: string, allData: any[], key: string): string[] => {
            const distractors = new Set<string>();
            while (distractors.size < 3) {
                const randomItem = allData[Math.floor(Math.random() * allData.length)];
                const value = randomItem[key];
                if (value && value !== correctAnswer) {
                    distractors.add(value);
                }
            }
            return Array.from(distractors);
        };

        for (const provData of provincesData) {
            const province = await provinceRepository.findOneBy({ name: provData.name });

            if (!province) {
                console.warn(`Province not found: ${provData.name}`);
                continue;
            }

            // Ambil data terkait provinsi ini
            const house = traditionalHousesData.find(h => h.province_name === provData.name);
            const dance = traditionalDancesData.find(d => d.province_name === provData.name);
            const weapon = traditionalWeaponsData.find(w => w.province_name === provData.name);
            const culinary = culinariesData.find(c => c.province_name === provData.name);
            const spot = tourismSpotsData.find(t => t.province_name === provData.name);
            const song = regionalSongsData.find(s => s.province_name === provData.name);

            // Array penampung pertanyaan
            const quizzesToSave: any[] = [];

            // 1. PERTANYAAN IBU KOTA
            const capitalDistractors = getDistractors(provData.capital_city, provincesData, 'capital_city');
            quizzesToSave.push({
                question: `Apa nama ibu kota dari provinsi ${provData.name}?`,
                answer: provData.capital_city,
                choices: shuffleArray([provData.capital_city, ...capitalDistractors]),
                explanation: `${provData.capital_city} adalah pusat pemerintahan dan ibu kota resmi provinsi ${provData.name}.`,
                province: province
            });

            // 2. PERTANYAAN RUMAH ADAT
            if (house) {
                const houseDistractors = getDistractors(house.name, traditionalHousesData, 'name');
                quizzesToSave.push({
                    question: `Rumah adat yang berasal dari provinsi ${provData.name} adalah...`,
                    answer: house.name,
                    choices: shuffleArray([house.name, ...houseDistractors]),
                    explanation: `${house.name} adalah rumah tradisional khas masyarakat ${provData.name}.`,
                    province: province
                });
            }

            // 3. PERTANYAAN TARIAN
            if (dance) {
                const danceDistractors = getDistractors(dance.name, traditionalDancesData, 'name');
                quizzesToSave.push({
                    question: `Tarian tradisional yang terkenal dari ${provData.name} adalah...`,
                    answer: dance.name,
                    choices: shuffleArray([dance.name, ...danceDistractors]),
                    explanation: `${dance.name} merupakan tarian khas yang berasal dari daerah ${provData.name}.`,
                    province: province
                });
            }

            // 4. PERTANYAAN SENJATA
            if (weapon) {
                const weaponDistractors = getDistractors(weapon.name, traditionalWeaponsData, 'name');
                quizzesToSave.push({
                    question: `Senjata tradisional khas ${provData.name} disebut...`,
                    answer: weapon.name,
                    choices: shuffleArray([weapon.name, ...weaponDistractors]),
                    explanation: `${weapon.name} adalah senjata warisan budaya dari provinsi ${provData.name}.`,
                    province: province
                });
            }

            // 5. PERTANYAAN KULINER
            if (culinary) {
                const culinaryDistractors = getDistractors(culinary.name, culinariesData, 'name');
                quizzesToSave.push({
                    question: `Manakah di bawah ini yang merupakan makanan/minuman khas dari ${provData.name}?`,
                    answer: culinary.name,
                    choices: shuffleArray([culinary.name, ...culinaryDistractors]),
                    explanation: `${culinary.name} adalah kuliner populer yang berasal dari ${provData.name}.`,
                    province: province
                });
            }

            // 6. PERTANYAAN LAGU DAERAH
            if (song) {
                const songDistractors = getDistractors(song.title, regionalSongsData, 'title');
                quizzesToSave.push({
                    question: `Lagu daerah yang berjudul "${song.title}" berasal dari provinsi...`,
                    answer: provData.name, // Jawaban adalah nama provinsi
                    choices: shuffleArray([provData.name, ...getDistractors(provData.name, provincesData, 'name')]), // Pengecoh adalah nama provinsi lain
                    explanation: `Lagu "${song.title}" adalah lagu daerah yang berasal dari ${provData.name}.`,
                    province: province
                });
            }

            // 7. PERTANYAAN PARIWISATA
            if (spot) {
                const spotDistractors = getDistractors(spot.name, tourismSpotsData, 'name');
                quizzesToSave.push({
                    question: `Objek wisata "${spot.name}" terletak di provinsi...`,
                    answer: provData.name,
                    choices: shuffleArray([provData.name, ...getDistractors(provData.name, provincesData, 'name')]),
                    explanation: `${spot.name} adalah destinasi wisata andalan yang berada di wilayah ${provData.name}.`,
                    province: province
                });
            }

            // 8. PERTANYAAN HARI JADI (Format Date)
            const anniversary = new Date(provData.anniversary_date);
            const dateString = anniversary.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
            
            // Membuat pengecoh tanggal (sedikit tricky, kita acak tahun atau bulannya)
            const dateDistractors: string[] = [];
            for(let i=0; i<3; i++) {
                const d = new Date(provData.anniversary_date);
                d.setFullYear(d.getFullYear() + (Math.random() < 0.5 ? -1 : 1) * Math.floor(Math.random() * 10 + 1)); // Geser tahun
                dateDistractors.push(d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }));
            }

            quizzesToSave.push({
                question: `Kapan tanggal hari jadi provinsi ${provData.name}?`,
                answer: dateString,
                choices: shuffleArray([dateString, ...dateDistractors]),
                explanation: `Provinsi ${provData.name} merayakan hari jadinya setiap tanggal ${dateString}.`,
                province: province
            });

            // --- SIMPAN KE DATABASE ---
            for (const quizData of quizzesToSave) {
                 // Cek duplikasi agar tidak double saat re-seed
                 const existing = await quizRepository.findOneBy({
                    question: quizData.question,
                    province: { id: province.id }
                 });

                 if (!existing) {
                    const newQuiz = quizRepository.create(quizData);
                    await quizRepository.save(newQuiz);
                 }
            }
            
            console.log(`Generated ${quizzesToSave.length} quizzes for ${provData.name}`);
        }
    }
}