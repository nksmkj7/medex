import { Factory } from 'typeorm-seeding';
import { Connection } from 'typeorm';
import axios from 'axios';
import { StaticPageEntity } from 'src/static-page/entity/static-page.entity';

export default class CreateStaticPageSeeder {
  public async run(factory: Factory, connection: Connection): Promise<any> {
    //       - Terms & Conditions
    // - Privacy Policy
    // - About Us
    // - FAQ
    // - Refund Policy
    const staticPages = [
      {
        title: 'Terms & Conditions',
        slug: 'terms-condition'
      },
      {
        title: 'About Us',
        slug: 'about-us'
      },
      {
        title: 'Refund Policy',
        slug: 'refund-policy'
      }
    ];

    try {
      if (Object.keys(staticPages).length > 0) {
        await connection
          .createQueryBuilder()
          .insert()
          .into(StaticPageEntity)
          .values(staticPages)
          .orIgnore()
          .execute();
      }
    } catch (error) {
      throw error;
    }
  }
}
