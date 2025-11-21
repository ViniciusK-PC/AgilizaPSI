const { PrismaClient, UserRole } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function createAdmins() {
  try {
    console.log("\n🔐 Criando usuários Administradores...");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    
    // Credenciais do Admin Principal
    const ADMIN_EMAIL = "admin@agilizapsi.com";
    const ADMIN_PASSWORD = "Admin@2024";
    const ADMIN_NAME = "Administrador";
    
    // Credenciais do Admin 1
    const ADMIN1_EMAIL = "admin1@agilizapsi.com";
    const ADMIN1_PASSWORD = "Admin1@2024!";
    const ADMIN1_NAME = "Administrador Principal";
    
    // Credenciais do Admin 2
    const ADMIN2_EMAIL = "admin2@agilizapsi.com";
    const ADMIN2_PASSWORD = "Admin2@2024!";
    const ADMIN2_NAME = "Administrador Secundário";
    
    const admins = [
      { email: ADMIN_EMAIL, password: ADMIN_PASSWORD, name: ADMIN_NAME },
      { email: ADMIN1_EMAIL, password: ADMIN1_PASSWORD, name: ADMIN1_NAME },
      { email: ADMIN2_EMAIL, password: ADMIN2_PASSWORD, name: ADMIN2_NAME },
    ];
    
    const createdAdmins = [];
    
    for (const adminData of admins) {
      // Verificar se já existe
      const existingAdmin = await prisma.user.findUnique({
        where: { email: adminData.email },
      });

      if (existingAdmin) {
        console.log(`\n⚠️  Admin já existe: ${adminData.email}`);
        console.log(`   Use a senha que você definiu anteriormente.`);
        continue;
      }

      // Hash da senha
      const hashedPassword = await bcrypt.hash(adminData.password, 10);

      // Gerar token
      const generateToken = () => {
        const min = 100000;
        const max = 999999;
        return Math.floor(Math.random() * (max - min + 1)) + min;
      };

      const userToken = generateToken();

      // Criar usuário Admin
      const admin = await prisma.user.create({
        data: {
          name: adminData.name,
          email: adminData.email,
          phone: "00000000000",
          password: hashedPassword,
          role: UserRole.ADMIN,
          token: userToken,
          isVerfied: true,
        },
      });

      createdAdmins.push({
        email: adminData.email,
        password: adminData.password,
        name: adminData.name,
      });

      console.log(`\n✅ Admin criado: ${adminData.name}`);
      console.log(`   📧 Email: ${adminData.email}`);
      console.log(`   🔑 Senha: ${adminData.password}`);
    }

    if (createdAdmins.length > 0) {
      console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("✅ RESUMO DAS CREDENCIAIS DE ADMIN");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      createdAdmins.forEach((admin, index) => {
        console.log(`\n👤 ADMIN ${index + 1}:`);
        console.log(`   📧 Email: ${admin.email}`);
        console.log(`   🔑 Senha: ${admin.password}`);
        console.log(`   👤 Nome: ${admin.name}`);
      });
      console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("⚠️  IMPORTANTE:");
      console.log("   • Altere as senhas após o primeiro login");
      console.log("   • Mantenha estas credenciais em local seguro");
      console.log("   • Estes usuários têm acesso total ao dashboard administrativo");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    } else {
      console.log("\n✅ Todos os admins já existem no sistema.\n");
    }
  } catch (error) {
    console.error("\n❌ Erro ao criar Administradores:", error);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  } finally {
    await prisma.$disconnect();
  }
}

createAdmins();

