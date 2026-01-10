import { DataSource } from 'typeorm';
import { MusicalInstrument } from '../musical-instruments/entities/musical-instrument.entity';
import { Province } from '../provinces/entities/province.entity';
import musicalInstrumentsData from './data/musical-instrument.data';
import { MUSIC_IMAGES } from './data/assets/music-image.data';

export const seedMusicalInstruments = async (dataSource: DataSource) => {
  const instrumentRepository = dataSource.getRepository(MusicalInstrument);
  const provinceRepository = dataSource.getRepository(Province);

  console.log('Seeding Musical Instruments...');

  for (const data of musicalInstrumentsData) {
    const province = await provinceRepository.findOneBy({ name: data.province_name });
    if (!province) {
      console.warn(`Province not found: ${data.province_name} for instrument ${data.name}. Skipping...`);
      continue;
    }

    const existingInstrument = await instrumentRepository.findOne({
      where: {
        name: data.name,
        province: { id: province.id }
      },
      relations: ['province']
    });

    if (!existingInstrument) {
      const newInstrument = instrumentRepository.create({
        name: data.name,
        cara_main: data.cara_main,
        image_url: data.image_url,
        province: province
      });
      await instrumentRepository.save(newInstrument);
      console.log(`✅ Created: ${data.name} in ${province.name}`);
    } else {
      console.log(`✏️ Updating existing instrument: ${data.name} in ${province.name}`);
      await instrumentRepository.update(
        { id: existingInstrument.id },
        {
          name: data.name,
          cara_main: data.cara_main,
          image_url: data.image_url,
          province: province
        }
      );
    }
  }
};

export const seedMusicalInstrumentImages = async (dataSource: DataSource) => {
  const repository = dataSource.getRepository(MusicalInstrument);
  
  console.log('Memulai update gambar alat musik...');
  
  for (const [instrumentName, url] of Object.entries(MUSIC_IMAGES)) {
    // Mencari berdasarkan nama alat musik
    // Karena ada "Pikon" 2 kali (Papua Tengah & Pegunungan), kode ini akan mengupdate KEDUANYA dengan URL yang sama.
    // Jika ingin beda, harus query spesifik dengan provinsi, tapi datamu URL-nya sama persis untuk Pikon.
    const result = await repository.update(
      { name: instrumentName }, 
      { image_url: url }
    );
    
    if (result.affected === 0) {
      console.warn(`Warning: Alat Musik "${instrumentName}" tidak ditemukan di database.`);
    }
  }
  
  console.log('Update gambar alat musik selesai!');
};