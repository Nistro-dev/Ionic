<?php

namespace App\Command;

use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;

class CheckJwtKeysCommand extends Command
{
    private $params;

    public function __construct(ParameterBagInterface $params)
    {
        parent::__construct();
        $this->params = $params;
    }

    protected function configure(): void
    {
        $this
            ->setName('app:check-jwt-keys')
            ->setDescription('Vérifie la configuration des clés JWT');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);
        $projectDir = $this->params->get('kernel.project_dir');

        $privateKeyPath = $projectDir . '/config/jwt/private.pem';
        $publicKeyPath = $projectDir . '/config/jwt/public.pem';

        $io->section('Vérification des clés JWT');

        // Vérifier l'existence des fichiers
        if (!file_exists($privateKeyPath)) {
            $io->error('Le fichier de clé privée n\'existe pas : ' . $privateKeyPath);
            return Command::FAILURE;
        }

        if (!file_exists($publicKeyPath)) {
            $io->error('Le fichier de clé publique n\'existe pas : ' . $publicKeyPath);
            return Command::FAILURE;
        }

        // Vérifier le contenu des fichiers
        $privateKey = file_get_contents($privateKeyPath);
        $publicKey = file_get_contents($publicKeyPath);

        if (strpos($privateKey, '-----BEGIN RSA PRIVATE KEY-----') === false) {
            $io->error('Le fichier de clé privée n\'est pas au format RSA');
            return Command::FAILURE;
        }

        if (strpos($publicKey, '-----BEGIN PUBLIC KEY-----') === false) {
            $io->error('Le fichier de clé publique n\'est pas au format RSA');
            return Command::FAILURE;
        }

        // Vérifier les permissions
        if (!is_readable($privateKeyPath)) {
            $io->error('Le fichier de clé privée n\'est pas lisible');
            return Command::FAILURE;
        }

        if (!is_readable($publicKeyPath)) {
            $io->error('Le fichier de clé publique n\'est pas lisible');
            return Command::FAILURE;
        }

        $io->success('Les clés JWT sont correctement configurées');
        return Command::SUCCESS;
    }
} 