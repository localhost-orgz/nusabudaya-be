import { DataSource } from 'typeorm';
import { ImageGuess } from 'src/image-guesses/entities/image-guess.entity';
import { Province } from 'src/provinces/entities/province.entity';
import { TraditionalWeapon } from 'src/traditional-weapons/entities/traditional-weapon.entity';
import { TraditionalHouse } from 'src/traditional-houses/entities/traditional-house.entity';
import { Culinary } from 'src/culinaries/entities/culinary.entity';
import { TourismSpot } from 'src/tourism-spots/entities/tourism-spot.entity';
import { MusicalInstrument } from 'src/musical-instruments/entities/musical-instrument.entity';

// --- HELPER FUNCTIONS ---
function shuffleArray(array: any[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function getChoices(correctAnswer: string, allItems: string[]) {
  const otherItems = allItems.filter(item => item !== correctAnswer);
  const shuffled = shuffleArray([...otherItems]);
  const distractors = shuffled.slice(0, 3);
  return shuffleArray([correctAnswer, ...distractors]);
}

function getMethodChoices(correctMethod: string) {
  const allMethods = ["Dipukul", "Ditiup", "Dipetik", "Digesek", "Ditepuk", "Digoyangkan"];
  return getChoices(correctMethod, allMethods);
}

// --- MAIN SEEDER ---
export const seedImageGuesses = async (dataSource: DataSource) => {
  const imageGuessRepo = dataSource.getRepository(ImageGuess);
  const provinceRepo = dataSource.getRepository(Province);
  
  // Repositories Sumber Data
  const weaponRepo = dataSource.getRepository(TraditionalWeapon);
  const houseRepo = dataSource.getRepository(TraditionalHouse);
  const culinaryRepo = dataSource.getRepository(Culinary);
  const tourismRepo = dataSource.getRepository(TourismSpot);
  const musicRepo = dataSource.getRepository(MusicalInstrument);

  console.log('Memulai generate Image Guess Game (Target: 8 Soal/Provinsi)...');

  // 1. Ambil Pengecoh
  const allWeapons = (await weaponRepo.find()).map(i => i.name);
  const allHouses = (await houseRepo.find()).map(i => i.name);
  const allCulinaries = (await culinaryRepo.find()).map(i => i.name);
  const allTourism = (await tourismRepo.find()).map(i => i.name);
  const allMusic = (await musicRepo.find()).map(i => i.name);
  const allProvinces = (await provinceRepo.find()).map(i => i.name);
  const allCapitals = (await provinceRepo.find()).map(i => i.capital_city)

  // 2. Ambil data provinsi dengan semua relasinya
  const provinces = await provinceRepo.find({
    relations: [
      'traditionalWeapons', 
      'traditionalHouses', 
      'culinaries', 
      'tourismSpots',
      'musicalInstruments'
    ]
  });

  const guessesToSave: ImageGuess[] = [];

  for (const province of provinces) {
    // Kumpulkan semua kemungkinan soal dari provinsi ini ke dalam 'Pool'
    const questionPool: any[] = [];

    // --- VARIATION 1: TEBAK SENJATA ---
    province.traditionalWeapons.forEach(item => {
      if (item.image_url) questionPool.push({ type: 'weapon', data: item });
    });

    // --- VARIATION 2: TEBAK RUMAH ADAT ---
    province.traditionalHouses.forEach(item => {
      if (item.image_url) questionPool.push({ type: 'house', data: item });
    });

    // --- VARIATION 3: TEBAK KULINER ---
    province.culinaries.forEach(item => {
      if (item.image_url) questionPool.push({ type: 'culinary', data: item });
    });

    // --- VARIATION 4: TEBAK WISATA ---
    province.tourismSpots.forEach(item => {
      if (item.image_url) questionPool.push({ type: 'tourism', data: item });
    });

    // --- VARIATION 5: TEBAK ALAT MUSIK (NAMA) ---
    province.musicalInstruments.forEach(item => {
      if (item.image_url) questionPool.push({ type: 'music_name', data: item });
    });

    // --- VARIATION 6: TEBAK PROVINSI (DARI LOGO) ---
    if (province.icon_url) {
      questionPool.push({ type: 'logo_province', data: province });
    }

    // --- VARIATION 7: TEBAK CARA MAIN ALAT MUSIK ---
    // Menggunakan gambar alat musik yang sama, tapi pertanyaannya beda
    province.musicalInstruments.forEach(item => {
      if (item.image_url && item.cara_main) {
        questionPool.push({ type: 'music_method', data: item });
      }
    });

    // --- VARIATION 8: TEBAK IBUKOTA (DARI LOGO) ---
    // Menggunakan gambar logo, tapi menanyakan ibukota
    if (province.icon_url && province.capital_city) {
      questionPool.push({ type: 'logo_capital', data: province });
    }

    // --- SELEKSI SOAL ---
    // Kita acak pool, lalu ambil 8 teratas.
    // Karena kita sudah push 8 jenis variasi (jika datanya lengkap), 
    // kemungkinan besar akan dapat 8 soal unik.
    const shuffledPool = shuffleArray(questionPool);
    const selectedItems = shuffledPool.slice(0, 8);

    for (const entry of selectedItems) {
      const item = entry.data;
      const guess = new ImageGuess();
      guess.province = province;
      
      // Tentukan URL Gambar
      if (entry.type === 'logo_province' || entry.type === 'logo_capital') {
        guess.image_url = province.icon_url;
      } else {
        guess.image_url = item.image_url;
      }

      // Logic Pertanyaan & Jawaban
      switch (entry.type) {
        case 'weapon':
          guess.question = `Senjata tradisional khas ${province.name} pada gambar ini bernama...`;
          guess.answer = item.name;
          guess.choices = getChoices(item.name, allWeapons);
          guess.explanation = `${item.name} adalah senjata tradisional dari ${province.name}.`;
          break;

        case 'house':
          guess.question = `Rumah adat dengan arsitektur unik ini disebut...`;
          guess.answer = item.name;
          guess.choices = getChoices(item.name, allHouses);
          guess.explanation = `${item.name} adalah rumah adat kebanggaan masyarakat ${province.name}.`;
          break;

        case 'culinary':
          guess.question = `Apakah nama kuliner khas ${province.name} yang terlihat lezat ini?`;
          guess.answer = item.name;
          guess.choices = getChoices(item.name, allCulinaries);
          guess.explanation = `${item.name} merupakan makanan khas yang populer di ${province.name}.`;
          break;

        case 'tourism':
          guess.question = `Lokasi wisata yang pemandangannya indah ini bernama...`;
          guess.answer = item.name;
          guess.choices = getChoices(item.name, allTourism);
          guess.explanation = `${item.name} adalah destinasi wisata unggulan di ${province.name}.`;
          break;

        case 'music_name':
          guess.question = `Alat musik tradisional dari ${province.name} ini adalah...`;
          guess.answer = item.name;
          guess.choices = getChoices(item.name, allMusic);
          guess.explanation = `${item.name} sering dimainkan dalam upacara adat di ${province.name}.`;
          break;

        case 'music_method': // SOAL NOMOR 7
          guess.question = `Perhatikan alat musik ${item.name} di atas. Cara memainkannya adalah dengan...`;
          guess.answer = item.cara_main; // Pastikan kolom cara_main ada di entity/db
          guess.choices = getMethodChoices(item.cara_main);
          guess.explanation = `${item.name} dimainkan dengan cara ${item.cara_main.toLowerCase()}.`;
          break;

        case 'logo_province':
          guess.question = `Gambar di atas adalah lambang dari provinsi...`;
          guess.answer = province.name;
          guess.choices = getChoices(province.name, allProvinces);
          guess.explanation = `Ini adalah lambang resmi pemerintah provinsi ${province.name}.`;
          break;

        case 'logo_capital': // SOAL NOMOR 8
          guess.question = `Berdasarkan lambang daerah di atas, apakah nama IBUKOTA provinsi tersebut?`;
          guess.answer = province.capital_city;
          guess.choices = getChoices(province.capital_city, allCapitals);
          guess.explanation = `Ibukota provinsi ${province.name} adalah ${province.capital_city}.`;
          break;
      }

      guessesToSave.push(guess);
    }
  }

  // Hapus data lama agar tidak duplikat
  // await imageGuessRepo.clear(); 

  // Simpan Batch
  await imageGuessRepo.save(guessesToSave);

  console.log(`Berhasil membuat total ${guessesToSave.length} soal Tebak Gambar!`);
};