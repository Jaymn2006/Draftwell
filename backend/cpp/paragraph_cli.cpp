#include "paragraph_index.hpp"
#include <iostream>
#include <string>
#include <sstream>

int main() {
    std::ostringstream buffer;
    buffer << std::cin.rdbuf();
    const std::string content = buffer.str();

    draftwell::ParagraphIndexer indexer(content);
    std::cout << "paragraphs=" << indexer.count()
              << " hash=" << indexer.content_hash() << "\n";

    for (const auto& span : indexer.spans()) {
        std::cout << "  [" << span.index << "] "
                  << span.start_offset << ".." << span.end_offset << "\n";
    }
    return 0;
}
