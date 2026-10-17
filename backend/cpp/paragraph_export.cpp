#include "paragraph_index.hpp"
#include <cstring>
#include <memory>

using draftwell::ParagraphIndexer;

extern "C" {

ParagraphIndexer* draftwell_paragraph_create(const char* content) {
    if (!content) return nullptr;
    return new ParagraphIndexer(std::string(content));
}

void draftwell_paragraph_free(ParagraphIndexer* idx) {
    delete idx;
}

int draftwell_paragraph_count(const ParagraphIndexer* idx) {
    if (!idx) return 0;
    return static_cast<int>(idx->count());
}

int draftwell_paragraph_at_offset(const ParagraphIndexer* idx, size_t offset) {
    if (!idx) return 0;
    return idx->paragraph_at_offset(offset);
}

unsigned long long draftwell_paragraph_hash(const ParagraphIndexer* idx) {
    if (!idx) return 0;
    return idx->content_hash();
}

}  // extern "C"
